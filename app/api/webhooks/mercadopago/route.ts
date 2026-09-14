import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createServerClient } from "@/lib/supabase/client";

/**
 * Valida la firma `x-signature` de Mercado Pago.
 *
 * Algoritmo oficial (Checkout Pro / Webhooks con x-Signature):
 *  - header x-signature: "ts=<timestamp>,v1=<hmac hex>"
 *  - manifest: "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
 *    (los pares ausentes se omiten del template)
 *  - HMAC-SHA256(manifest, webhook secret) en hexadecimal
 *  - comparación timing-safe contra v1
 */
function verifyXSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string
): boolean {
  const pairs = Object.fromEntries(
    xSignature
      .split(",")
      .map((part) => part.trim().split("="))
      .filter((kv) => kv.length >= 2)
      .map(([key, ...val]) => [key, val.join("=")])
  );

  const ts = pairs["ts"];
  const v1 = pairs["v1"];
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return false;

  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const hashBuf = Buffer.from(v1, "utf8");
  const expectedBuf = Buffer.from(expected, "utf8");

  if (hashBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(hashBuf, expectedBuf);
}

function getPaymentStatus(paymentStatus: string): string {
  if (paymentStatus === "approved") return "approved";
  if (paymentStatus === "rejected") return "rejected";
  if (paymentStatus === "cancelled" || paymentStatus === "refunded")
    return paymentStatus;
  return "pending";
}

function getOrderStatus(paymentStatus: string): string {
  if (paymentStatus === "approved") return "processing";
  if (paymentStatus === "rejected" || paymentStatus === "cancelled")
    return "cancelled";
  if (paymentStatus === "refunded") return "refunded";
  return "payment_pending";
}

async function sendPaymentEmail(
  email: string,
  orderNumber: string,
  status: string
) {
  const token = process.env.RESEND_API_KEY;
  if (!token) return;

  const approved = status === "approved";
  const subject = approved
    ? `¡Pago aprobado! Tu pedido ${orderNumber} está en camino`
    : `Actualización de tu pago ${orderNumber}`;

  try {
    await fetch("https://api.resend.com/emails", {
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

async function updateOrderStatus(
  supabase: ReturnType<typeof createServerClient>,
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
    await sendPaymentEmail(email, externalReference, status);
  }
}

export async function POST(request: NextRequest) {
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

  const mpResponse = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: *** ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
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
    const supabase = createServerClient();
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