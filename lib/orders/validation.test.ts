import { describe, expect, it } from "vitest";

import { validateOrderData, type OrderBody } from "./validation";

// Pins del P1-4 (SACRE): validación pura del body de /api/orders/create.
//
// Contrato del front (app/checkout/page.tsx + CartContext getTotal):
//   { order_number, customer:{firstName,lastName,email,phone?},
//     shipping:{method,...}, payment_method,
//     items:[{product_id, quantity, price}], subtotal, shipping_cost?, total }
// con subtotal = Σ(price·qty) y total = subtotal + (shipping_cost||0).
//
// No-breaking: TODO payload válido de hoy debe seguir pasando; sólo el
// shape roto (quantity<=0, price<=0, email inválido, totales incoherentes)
// empieza a recibir 400 ANTES de tocar la DB o MercadoPago.
//
// Nota ORN-127: el precio de la DB SIEMPRE gana (resolveAndValidateItems);
// estos checks son de shape/coherencia del body, no de verdad de precios.

function validBody(): OrderBody {
  return {
  order_number: "SACRE-TEST-1",
  customer: {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
  },
  shipping: { method: "pickup" },
  payment_method: "mercadopago",
  items: [
    { product_id: "product-a", productName: "Product A", quantity: 2, price: 1500 },
  ],
  subtotal: 3000,
  shipping_cost: 0,
  total: 3000,
  };
}

describe("validateOrderData — payload válido (no-breaking)", () => {
  it("acepta el payload real del checkout sin errores", () => {
    expect(validateOrderData(validBody())).toBeNull();
  });

  it("acepta shipping_cost ausente (envío gratis implícito)", () => {
    const body = validBody();
    delete body.shipping_cost;
    expect(validateOrderData(body)).toBeNull();
  });

  it("acepta varios ítems con subtotal y total coherentes", () => {
    const body = validBody();
    body.items = [
      { product_id: "a", quantity: 1, price: 1000 },
      { product_id: "b", quantity: 3, price: 500 },
    ];
    body.subtotal = 1000 + 1500;
    body.total = 2500 + 800;
    body.shipping_cost = 800;
    expect(validateOrderData(body)).toBeNull();
  });

  it("acepta floats con ruido de redondeo en la suma (epsilon)", () => {
    const body = validBody();
    body.items = [{ product_id: "a", quantity: 3, price: 3333.33 }];
    body.subtotal = 9999.99;
    body.shipping_cost = 0;
    body.total = 9999.99;
    expect(validateOrderData(body)).toBeNull();
  });
});

describe("validateOrderData — shape requerido", () => {
  it("rechaza order_number ausente", () => {
    const body = validBody();
    delete (body as { order_number?: string }).order_number;
    expect(validateOrderData(body)).toBe("Faltan datos requeridos");
  });

  it("rechaza email ausente", () => {
    const body = validBody();
    delete (body.customer as { email?: string }).email;
    expect(validateOrderData(body)).toBe("Email del cliente es requerido");
  });

  it("rechaza formato de email inválido", () => {
    const body = validBody();
    body.customer.email = "no-es-mail";
    expect(validateOrderData(body)).toBe("Formato de email inválido");
  });

  it("rechaza carrito vacío", () => {
    const body = validBody();
    body.items = [];
    expect(validateOrderData(body)).toBe("El carrito está vacío");
  });

  it("rechaza items sin shape de array (items: null)", () => {
    const body = validBody();
    (body as { items?: unknown }).items = null;
    expect(validateOrderData(body)).toBe("El carrito está vacío");
  });
});

describe("validateOrderData — items", () => {
  it("rechaza quantity 0", () => {
    const body = validBody();
    body.items[0].quantity = 0;
    expect(validateOrderData(body)).toBe("Cantidad inválida en el ítem 1");
  });

  it("rechaza quantity fraccionada (0.5)", () => {
    const body = validBody();
    body.items[0].quantity = 0.5;
    expect(validateOrderData(body)).toBe("Cantidad inválida en el ítem 1");
  });
});

describe("validateOrderData — items: price", () => {
  it("rechaza price 0", () => {
    const body = validBody();
    body.items[0].price = 0;
    expect(validateOrderData(body)).toBe("Precio inválido en el ítem 1");
  });

  it("rechaza price negativo", () => {
    const body = validBody();
    body.items[0].price = -10;
    expect(validateOrderData(body)).toBe("Precio inválido en el ítem 1");
  });
});

describe("validateOrderData — coherencia de totales", () => {
  it("rechaza subtotal que no coincide con la suma de ítems", () => {
    const body = validBody();
    body.subtotal = 1; // items suman 3000
    body.total = 1;
    expect(validateOrderData(body)).toBe(
      "Subtotal no coincide con los ítems del carrito"
    );
  });

  it("rechaza shipping_cost negativo", () => {
    const body = validBody();
    body.shipping_cost = -5;
    body.total = 2995;
    expect(validateOrderData(body)).toBe("Costo de envío inválido");
  });

  it("rechaza total que no coincide con subtotal + envío", () => {
    const body = validBody();
    body.shipping_cost = 800;
    body.total = 999999; // debería ser 3800
    expect(validateOrderData(body)).toBe(
      "Total no coincide con subtotal + envío"
    );
  });
});
