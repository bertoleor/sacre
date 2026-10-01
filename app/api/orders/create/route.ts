import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/client";
import {
  resolveAndValidateItems,
  type ResolvedOrderItem,
} from "@/lib/orders/create";
import {
  validateOrderData,
  type OrderBody,
} from "@/lib/orders/validation";
import { demoOrderResponse } from "@/lib/orders/demo";

async function createSupabaseOrder(
  supabase: ReturnType<typeof createServerClient>,
  orderData: OrderBody,
  amounts: { subtotal: number; total: number }
) {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderData.order_number,
      customer_first_name: orderData.customer.firstName,
      customer_last_name: orderData.customer.lastName,
      customer_email: orderData.customer.email,
      customer_phone: orderData.customer.phone,
      guest_email: orderData.customer.email,
      shipping_method: orderData.shipping.method,
      shipping_address_line1: orderData.shipping.addressLine1,
      shipping_city: orderData.shipping.city,
      shipping_state: orderData.shipping.state,
      shipping_postal_code: orderData.shipping.postalCode,
      payment_method: orderData.payment_method,
      status: "pending",
      payment_status: "pending",
      subtotal: amounts.subtotal,
      shipping_cost: orderData.shipping_cost,
      total: amounts.total,
    })
    .select()
    .single();

  if (orderError) throw orderError;
  return order;
}

async function createOrderItems(
  supabase: ReturnType<typeof createServerClient>,
  orderId: string,
  items: ResolvedOrderItem[]
) {
  if (!items.length) return;

  const orderItems = items.map((item) => ({
    order_id: orderId,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.subtotal,
    product_name: item.product_name,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;
}

async function createMercadoPagoPreference(
  orderNumber: string,
  items: ResolvedOrderItem[],
  siteUrl: string
): Promise<string | null> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return null;

  try {
    const mpResponse = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            title: item.product_name || "Producto SACRÉ",
            quantity: item.quantity,
            unit_price: item.unit_price,
            currency_id: "ARS",
          })),
          back_urls: {
            success: `${siteUrl}/checkout/success`,
            failure: `${siteUrl}/checkout/failure`,
            pending: `${siteUrl}/checkout/pending`,
          },
          external_reference: orderNumber,
          notification_url: `${siteUrl}/api/webhooks/mercadopago`,
        }),
      }
    );

    const mpData = await mpResponse.json();
    return mpData.init_point || null;
  } catch (error) {
    console.error("MercadoPago error:", error);
    return null;
  }
}

async function sendConfirmationEmail(
  customerEmail: string,
  orderNumber: string,
  total: number,
  paymentUrl: string | null
) {
  const token = process.env.RESEND_API_KEY;
  if (!token) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
              from: "SACRÉ <noreply@sacre.com.ar>",
              to: customerEmail,
        subject: `Confirmación de tu pedido ${orderNumber}`,
        html: `
          <h1>¡Gracias por tu compra!</h1>
          <p>Tu número de pedido es: <strong>${orderNumber}</strong></p>
          <p>Total: $${total.toLocaleString("es-AR")}</p>
          ${
            paymentUrl
              ? `<p><a href="${paymentUrl}">Pagar con MercadoPago</a></p>`
              : ""
          }
        `,
      }),
    });
  } catch (error) {
    console.error("Email error:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderBody = await request.json();

    const validationError = validateOrderData(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    let supabase;
    try {
      supabase = createServerClient();
    } catch {
      // Demo mode - Supabase not configured. The order is NOT persisted and
      // MercadoPago never runs; the response must say so explicitly (P1-4).
      console.warn(
        "[orders/create] Supabase not configured — answering in DEMO mode; the order is NOT persisted"
      );
      return NextResponse.json(demoOrderResponse(body.order_number));
    }

    // ORN-127: resolve slugs → uuids and validate price/stock server-side
    // BEFORE any insert. The client-supplied price never reaches the DB.
    const resolved = await resolveAndValidateItems(supabase, body.items);
    if (!resolved.ok) {
      return NextResponse.json(
        { error: resolved.message, code: resolved.code },
        { status: resolved.status }
      );
    }

    // Server-side totals: the DB is the only source of truth. The client
    // subtotal/total stay in the request body for validation but NEVER reach
    // the orders row. Divergence is logged for observability (a mismatch
    // usually means a stale ISR cache or a tampered checkout).
    const serverSubtotal = resolved.subtotal;
    const shippingCost =
      typeof body.shipping_cost === "number" && body.shipping_cost > 0
        ? body.shipping_cost
        : 0;
    const serverTotal = serverSubtotal + shippingCost;
    if (
      body.subtotal !== serverSubtotal ||
      body.total !== serverTotal
    ) {
      console.warn("[orders/create] client-total mismatch", {
        order_number: body.order_number,
        client_subtotal: body.subtotal,
        client_total: body.total,
        server_subtotal: serverSubtotal,
        server_total: serverTotal,
      });
    }

    const order = await createSupabaseOrder(supabase, body, {
      subtotal: serverSubtotal,
      total: serverTotal,
    });
    await createOrderItems(supabase, order.id, resolved.items);

    let paymentUrl = null;
    if (body.payment_method === "mercadopago") {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      paymentUrl = await createMercadoPagoPreference(
        body.order_number,
        resolved.items,
        siteUrl
      );
    }

    await sendConfirmationEmail(
      body.customer.email,
      body.order_number,
      serverTotal,
      paymentUrl
    );

    return NextResponse.json({
      success: true,
      orderId: body.order_number,
      paymentUrl,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Error al crear el pedido" },
      { status: 500 }
    );
  }
}
