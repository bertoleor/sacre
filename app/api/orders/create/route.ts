import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/client";

interface OrderItem {
  product_id?: string;
  productName?: string;
  quantity: number;
  price: number;
}

interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface Shipping {
  method: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

interface OrderBody {
  order_number: string;
  customer: Customer;
  shipping: Shipping;
  payment_method: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost?: number;
  total: number;
}

function validateOrderData(body: OrderBody): string | null {
  if (!body.order_number) return "Faltan datos requeridos";
  if (!body.customer?.email) return "Email del cliente es requerido";
  if (!body.items?.length) return "El carrito está vacío";
  if (body.subtotal === undefined) return "Subtotal requerido";
  return null;
}

async function createSupabaseOrder(
  supabase: ReturnType<typeof createServerClient>,
  orderData: OrderBody
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
      subtotal: orderData.subtotal,
      shipping_cost: orderData.shipping_cost,
      total: orderData.total,
    })
    .select()
    .single();

  if (orderError) throw orderError;
  return order;
}

async function createOrderItems(
  supabase: ReturnType<typeof createServerClient>,
  orderId: string,
  items: OrderItem[]
) {
  if (!items.length) return;

  const orderItems = items.map((item) => ({
    order_id: orderId,
    product_id: item.product_id || "unknown",
    quantity: item.quantity,
    unit_price: item.price,
    subtotal: item.price * item.quantity,
    product_name: item.productName || "Producto",
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;
}

async function createMercadoPagoPreference(
  orderNumber: string,
  items: OrderItem[],
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
                    title: item.productName || "Producto SACRÉ",
                    quantity: item.quantity,
                    unit_price: item.price,
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
      // Demo mode - Supabase not configured
      console.log("Supabase not configured, returning mock response");
      return NextResponse.json({
        success: true,
        orderId: body.order_number,
        message: "Pedido creado (modo demo - sin base de datos)",
      });
    }

    const order = await createSupabaseOrder(supabase, body);
    await createOrderItems(supabase, order.id, body.items);

    let paymentUrl = null;
    if (body.payment_method === "mercadopago") {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      paymentUrl = await createMercadoPagoPreference(
        body.order_number,
        body.items,
        siteUrl
      );
    }

    await sendConfirmationEmail(
      body.customer.email,
      body.order_number,
      body.total,
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
