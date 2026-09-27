import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/client";
import {
  verifyXSignature,
  getPaymentStatus,
  getOrderStatus,
} from "@/lib/webhooks/mercadopago";

/**
 * Dependencias inyectables del handler. En producción el seam queda vacío
 * y se usan las reales; en tests se inyectan mocks explícitos para no
 * requerir red ni DB. El contrato HTTP observable no cambia (401/400/200).
 *
 * NOTA: la inyección NO va por segundo parámetro de POST porque Next 16
 * typegen exige que ese parámetro sea el contexto de ruta `{ params }`.
 */
export interface WebhookDeps {
  fetchImpl?: typeof fetch;
  createClientImpl?: () => ReturnType<typeof createServerClient>;
  sendEmailImpl?: typeof sendPaymentEmail;
}

/** Seam de test: los tests asignan mocks acá antes de invocar POST. */
export const __testDeps: WebhookDeps = {};

async function sendPaymentEmail(
  email: string,
  orderNumber: string,
  status: string,
  fetchImpl: typeof fetch = fetch
): Promise<void> {
  const token = process.env.RESEND_API_KEY;
  if (!token) return;

  const approved = status === "approved";
  const subject = approved
    ? `¡Pago aprobado! Tu pedido ${orderNumber} está en camino`
    : `Actualización de tu pago ${orderNumber}`;

  try {
    await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        from: "SACRÉ <noreply@sacre.com.ar>",
        to: email,
        subject,
        html: `
          <h1>${approved ? "¡Pago acreditado! 🎉" : "Actualización de tu pedido"}</h1>
          <p>Pedido: <strong>${orderNumber}</strong></p>
          <p>Estado del pago: <strong>${status}</strong></p>
          ${
            approved
              ? "<p>Nos pusimos a preparar tu pedido. Te avisamos cuando esté listo.</p>"
              : "<p>Si tenés dudas, escribinos a hola@sacre.com.ar</p>"
          }
        `,
      }),
    });
  } catch (error) {
    console.error("Payment email error:", error);
  }
}

type SupabaseLike = ReturnType<typeof createServerClient>;

async function updateOrderStatus(
  supabase: SupabaseLike,
  externalReference: string,
  paymentId: string,
  paymentStatus: string
): Promise<void> {
  const status = getPaymentStatus(paymentStatus);
  const orderStatus = getOrderStatus(status);

  // Idempotencia: si el pedido ya registró este payment_id con el mismo
  // estado, no repetimos el update ni la notificación.
  const { data: existing } = await supabase
    .from("orders")
    .select("payment_id, payment_status, guest_email, customer_email")
    .eq("order_number", externalReference)
    .single();

  const alreadyHandled =
    existing &&
    existing.payment_id === paymentId.toString() &&
    existing.payment_status === status;

  if (alreadyHandled) return;

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      payment_status: status,
      payment_id: paymentId.toString(),
      status: orderStatus,
      paid_at: status === "approved" ? new Date().toISOString() : null,
    })
    .eq("order_number", externalReference);

  if (updateError) {
    console.error("Order update error:", updateError);
  }

  // Idempotencia de notificaciones: no insertar duplicados por mismo payment.
  const { data: dupNotify } = await supabase
    .from("notifications")
    .select("id")
    .eq("order_id", externalReference)
    .eq("type", status === "approved" ? "payment_approved" : "payment_rejected")
    .eq("message", `El pago ${paymentId} ha sido ${status}`)
    .maybeSingle();

  if (dupNotify) return;

  const { error: notifyError } = await supabase
    .from("notifications")
    .insert({
      order_id: externalReference,
      type: status === "approved" ? "payment_approved" : "payment_rejected",
      title: status === "approved" ? "Pago aprobado" : "Pago rechazado",
      message: `El pago ${paymentId} ha sido ${status}`,
    });

  if (notifyError) {
    console.error("Notification insert error:", notifyError);
  }

  // Mail de aprobación/rechazo al cliente
  const email = existing?.customer_email || existing?.guest_email || null;
  if (email) {
    const sendEmail = __testDeps.sendEmailImpl ?? sendPaymentEmail;
    await sendEmail(email, externalReference, status);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const doFetch = __testDeps.fetchImpl ?? fetch;
  const createClient = __testDeps.createClientImpl ?? createServerClient;

  // Leemos el body UNA sola vez. Leerlo dos veces deja la segunda vacía.
  let data: any;
  try {
    data = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // === Validación de firma (NUNCA confiar en el body sin firmar) ===
  const xSignature = request.headers.get("x-signature") || "";
  const xRequestId =
    request.headers.get("x-request-id") || data?.data?.request_id || "";
  const dataId = data?.data?.id?.toString() ?? "";

  if (
    !xSignature ||
    !xRequestId ||
    !dataId ||
    !verifyXSignature(xSignature, xRequestId, dataId)
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { type, data: webhookData } = data;
  const paymentId = webhookData?.id;

  // Siempre ACK a MP para evitar reintentos en bucle (200 {success:true}).
  // Los tópicos distintos a `payment` (eg `merchant_order`) no se procesan.
  if (type !== "payment" || !paymentId) {
    return NextResponse.json({ success: true });
  }

  const mpResponse = await doFetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    }
  );

  const payment = await mpResponse.json().catch(() => null);
  const externalReference = payment?.external_reference;

  if (!externalReference) {
    console.error("No external reference on payment", paymentId);
    return NextResponse.json({ success: true });
  }

  try {
    const supabase = createClient();
    await updateOrderStatus(
      supabase,
      externalReference,
      paymentId,
      payment?.status || "pending"
    );
  } catch (dbError) {
    // Fallo de DB no debe romper el ACK a MP.
    console.error("Database update error:", dbError);
  }

  return NextResponse.json({ success: true });
}
