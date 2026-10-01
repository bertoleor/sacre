import { describe, expect, it } from "vitest";

import { demoOrderResponse } from "./demo";

// Pins del P1-4 (SACRE): señalización del modo demo de /api/orders/create.
//
// Cuando Supabase no está configurado, el route responde 200 con un mock
// (contrato existente, NO se elimina). Lo que agrega P1-4 es la señal
// explícita de que el pedido NO se persistió:
//   - demo:true  → el consumidor puede distinguir demo de pedido real
//   - paymentUrl:null → no hay checkout MP posible sin DB
//   - console.warn una vez → observable en logs del server

describe("demoOrderResponse", () => {
  it("marca la respuesta con demo:true", () => {
    const res = demoOrderResponse("SACRE-DEMO-1");
    expect(res.demo).toBe(true);
  });

  it("mantiene success:true y orderId del pedido (contrato existente)", () => {
    const res = demoOrderResponse("SACRE-DEMO-1");
    expect(res.success).toBe(true);
    expect(res.orderId).toBe("SACRE-DEMO-1");
  });

  it("explaya paymentUrl:null (sin checkout MP sin DB)", () => {
    const res = demoOrderResponse("SACRE-DEMO-1");
    expect(res.paymentUrl).toBeNull();
  });

  it("el mensaje explica que el pedido no se persistió", () => {
    const res = demoOrderResponse("SACRE-DEMO-1");
    expect(res.message).toContain("demo");
    expect(res.message).toContain("sin base de datos");
  });
});
