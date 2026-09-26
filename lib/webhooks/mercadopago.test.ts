import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { createHmac } from "crypto";
import {
  verifyXSignature,
  getPaymentStatus,
  getOrderStatus,
} from "./mercadopago";

const SECRET = "test-webhook-secret-sacre";

/**
 * Firma helper: replica el algoritmo oficial de Mercado Pago para
 * construir un x-signature válido en los tests.
 */
function signV1(
  dataId: string,
  requestId: string,
  ts: string,
  secret: string = SECRET
): string {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  return createHmac("sha256", secret).update(manifest).digest("hex");
}

describe("verifyXSignature", () => {
  beforeEach(() => {
    process.env.MERCADOPAGO_WEBHOOK_SECRET = SECRET;
  });

  afterEach(() => {
    delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
  });

  it("firma válida (ts + v1 correctos) → true", () => {
    const v1 = signV1("12345", "req-abc", "1699999999");
    expect(verifyXSignature(`ts=1699999999,v1=${v1}`, "req-abc", "12345")).toBe(
      true
    );
  });

  it("firma inválida (v1 que no corresponde) → false", () => {
    const v1 = signV1("99999", "req-abc", "1699999999");
    expect(verifyXSignature(`ts=1699999999,v1=${v1}`, "req-abc", "12345")).toBe(
      false
    );
  });

  it("sin ts en el header → false", () => {
    const v1 = signV1("12345", "req-abc", "1699999999");
    expect(verifyXSignature(`v1=${v1}`, "req-abc", "12345")).toBe(false);
  });

  it("sin v1 en el header → false", () => {
    expect(
      verifyXSignature("ts=1699999999", "req-abc", "12345")
    ).toBe(false);
  });

  it("secret ausente en env → false (nunca validar sin secret)", () => {
    delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
    const v1 = signV1("12345", "req-abc", "1699999999");
    expect(verifyXSignature(`ts=1699999999,v1=${v1}`, "req-abc", "12345")).toBe(
      false
    );
  });

  it("secret distinto al esperado → false", () => {
    const v1 = signV1("12345", "req-abc", "1699999999", "otro-secret");
    expect(verifyXSignature(`ts=1699999999,v1=${v1}`, "req-abc", "12345")).toBe(
      false
    );
  });

  it("v1 con largo distinto → false (salida temprana timing-safe)", () => {
    expect(
      verifyXSignature("ts=1699999999,v1=abc123", "req-abc", "12345")
    ).toBe(false);
  });

  it("par extra en el header (formato MP con más params) → sigue validando", () => {
    const v1 = signV1("12345", "req-abc", "1699999999");
    expect(
      verifyXSignature(
        `ts=1699999999,v1=${v1},u1=extra`,
        "req-abc",
        "12345"
      )
    ).toBe(true);
  });

  it("request-id distinto → false (manifest no coincide)", () => {
    const v1 = signV1("12345", "req-abc", "1699999999");
    expect(verifyXSignature(`ts=1699999999,v1=${v1}`, "req-xyz", "12345")).toBe(
      false
    );
  });

  it("dataId con inyección de manifest → false (sin secret no se puede firmar)", () => {
    // Un atacante inyecta ';' en data.id para reescribir el manifest.
    // El HMAC esperado cambia y no puede firmarlo sin el secret.
    const injected = "1;request-id:fake;ts:1;";
    const v1 = signV1("12345", "req-abc", "1699999999");
    expect(
      verifyXSignature(`ts=1699999999,v1=${v1}`, "req-abc", injected)
    ).toBe(false);
  });
});

describe("getPaymentStatus", () => {
  it("mapea approved → approved", () => {
    expect(getPaymentStatus("approved")).toBe("approved");
  });

  it("mapea rejected → rejected", () => {
    expect(getPaymentStatus("rejected")).toBe("rejected");
  });

  it("mapea cancelled y refunded sin cambio", () => {
    expect(getPaymentStatus("cancelled")).toBe("cancelled");
    expect(getPaymentStatus("refunded")).toBe("refunded");
  });

  it("cualquier otro estado → pending", () => {
    expect(getPaymentStatus("in_process")).toBe("pending");
    expect(getPaymentStatus("")).toBe("pending");
  });
});

describe("getOrderStatus", () => {
  it("mapea approved → processing", () => {
    expect(getOrderStatus("approved")).toBe("processing");
  });

  it("mapea rejected y cancelled → cancelled", () => {
    expect(getOrderStatus("rejected")).toBe("cancelled");
    expect(getOrderStatus("cancelled")).toBe("cancelled");
  });

  it("mapea refunded → refunded", () => {
    expect(getOrderStatus("refunded")).toBe("refunded");
  });

  it("cualquier otro estado → payment_pending", () => {
    expect(getOrderStatus("in_process")).toBe("payment_pending");
    expect(getOrderStatus("")).toBe("payment_pending");
  });
});
