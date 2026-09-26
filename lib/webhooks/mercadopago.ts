import { createHmac, timingSafeEqual } from "crypto";

/**
 * Lógica pura del webhook de Mercado Pago, extraída de
 * app/api/webhooks/mercadopago/route.ts para poder testearla.
 *
 * Algoritmo oficial (Checkout Pro / Webhooks con x-Signature):
 *  - header x-signature: "ts=<timestamp>,v1=<hmac hex>"
 *  - manifest: "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
 *  - HMAC-SHA256(manifest, webhook secret) en hexadecimal
 *  - comparación timing-safe contra v1
 */

export function verifyXSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
  secret: string | undefined = process.env.MERCADOPAGO_WEBHOOK_SECRET
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
  if (!secret) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const hashBuf = Buffer.from(v1, "utf8");
  const expectedBuf = Buffer.from(expected, "utf8");

  if (hashBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(hashBuf, expectedBuf);
}

export function getPaymentStatus(paymentStatus: string): string {
  if (paymentStatus === "approved") return "approved";
  if (paymentStatus === "rejected") return "rejected";
  if (paymentStatus === "cancelled" || paymentStatus === "refunded")
    return paymentStatus;
  return "pending";
}

export function getOrderStatus(paymentStatus: string): string {
  if (paymentStatus === "approved") return "processing";
  if (paymentStatus === "rejected" || paymentStatus === "cancelled")
    return "cancelled";
  if (paymentStatus === "refunded") return "refunded";
  return "payment_pending";
}
