// Validación pura del payload de /api/orders/create — SACRE P1-4.
//
// Extraída del route handler a módulo propio (aislado, testeable sin
// Next/supabase). Invariantes respetan el contrato real del front:
//   app/checkout/page.tsx manda { items:[{product_id,quantity,price}],
//   subtotal, shipping_cost, total } con subtotal = Σ(price·qty) y
//   total = subtotal + (shipping_cost||0)  (CartContext getTotal).
//
// No-breaking: el payload válido de hoy sigue pasando exactamente igual;
// el shape roto empieza a recibir 400 ANTES de tocar la DB o MercadoPago.
//
// Division of labour con ORN-127 (resolveAndValidateItems): esa validación
// verifica verdad de precios/stock CONTRA LA DB (server-side pricing). Esta
// valida el SHAPE y la coherencia interna del body que llega. Ambas corren:
// primero shape (acá), después verdad (resolveAndValidateItems).

const PRICE_EPSILON = 0.001;

export interface OrderItem {
  product_id?: string;
  productName?: string;
  quantity: number;
  price: number;
}

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface Shipping {
  method: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface OrderBody {
  order_number: string;
  customer: Customer;
  shipping: Shipping;
  payment_method: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost?: number;
  total: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function approxEqual(a: number, b: number, eps = PRICE_EPSILON): boolean {
  return Math.abs(a - b) <= eps;
}

function isPositiveNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

/** Valida el body del pedido. Devuelve null si es válido, o un mensaje si no. */
export function validateOrderData(body: OrderBody): string | null {
  if (!body.order_number) return "Faltan datos requeridos";

  const rawEmail = body.customer?.email;
  if (!rawEmail) return "Email del cliente es requerido";
  if (!EMAIL_RE.test(rawEmail)) return "Formato de email inválido";

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return "El carrito está vacío";
  }

  for (let i = 0; i < body.items.length; i++) {
    const item = body.items[i];
    // quantity debe ser un entero > 0.
    if (!Number.isInteger(item?.quantity) || item.quantity <= 0) {
      return `Cantidad inválida en el ítem ${i + 1}`;
    }
    if (!isPositiveNumber(item?.price)) {
      return `Precio inválido en el ítem ${i + 1}`;
    }
  }

  // El subtotal enviado debe coincidir con la suma de los ítems.
  const computedSubtotal = body.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  if (
    !isPositiveNumber(body.subtotal) ||
    !approxEqual(body.subtotal, computedSubtotal)
  ) {
    return "Subtotal no coincide con los ítems del carrito";
  }

  // shipping_cost >= 0 y opcional (0 por defecto en envío gratuito).
  const shippingCost = body.shipping_cost ?? 0;
  if (!Number.isFinite(shippingCost) || shippingCost < 0) {
    return "Costo de envío inválido";
  }

  // El total enviado debe coincidir con subtotal + envío (contrato CartContext).
  if (
    !isPositiveNumber(body.total) ||
    !approxEqual(body.total, body.subtotal + shippingCost)
  ) {
    return "Total no coincide con subtotal + envío";
  }

  return null;
}
