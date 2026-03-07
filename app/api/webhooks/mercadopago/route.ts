import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/client";

function getPaymentStatus(paymentStatus: string): string {
  if (paymentStatus === "approved") return "approved";
  if (paymentStatus === "rejected") return "rejected";
  return "pending";
}

function getOrderStatus(paymentStatus: string): string {
  if (paymentStatus === "approved") return "processing";
  if (paymentStatus === "rejected") return "cancelled";
  return "payment_pending";
}

async function updateOrderStatus(
  supabase: ReturnType<typeof createServerClient>,
  externalReference: string,
  paymentId: string,
  paymentStatus: string
): Promise<void> {
  const status = getPaymentStatus(paymentStatus);
  const orderStatus = getOrderStatus(status);

  await supabase
    .from("orders")
    .update({
      payment_status: status,
      payment_id: paymentId.toString(),
      status: orderStatus,
      paid_at: status === "approved" ? new Date().toISOString() : null,
    })
    .eq("order_number", externalReference);

  await supabase.from("notifications").insert({
    order_id: externalReference,
    type: status === "approved" ? "payment_approved" : "payment_rejected",
    title: status === "approved" ? "Pago aprobado" : "Pago rechazado",
    message: `El pago ${paymentId} ha sido ${status}`,
  });
}

export async function POST(request: NextRequest) {
  try {
    await request.text();
    
    const data = JSON.parse(await request.text());
    const { type, data: webhookData } = data;
    
    if (type !== "payment") {
      return NextResponse.json({ success: true });
    }
    
    const paymentId = webhookData?.id;
    
    if (!paymentId) {
      return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 });
    }
    
    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    );
    
    const payment = await mpResponse.json();
    const externalReference = payment.external_reference;
    
    if (!externalReference) {
      return NextResponse.json({ error: "No external reference" }, { status: 400 });
    }
    
    try {
      const supabase = createServerClient();
      await updateOrderStatus(supabase, externalReference, paymentId, payment.status);
    } catch (dbError) {
      console.error("Database update error:", dbError);
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
