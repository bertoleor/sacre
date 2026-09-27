import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { createHmac } from "crypto";
import type { WebhookDeps } from "./route";

/**
 * ORN-140 — Tests del POST handler del webhook de Mercado Pago.
 * TDD: ROJO ejecutado antes del refactor (5 failed: alias @/ sin resolver y
 * handler sin DI). El refactor usa un seam de módulo `__testDeps` porque
 * Next 16 typegen exige que el 2do parámetro de POST sea el contexto de
 * ruta `{ params }` — la DI por argumento rompía el contrato de tipos.
 * El contrato HTTP observable no cambia: 401 firma inválida / 400 JSON
 * inválido / 200 {success:true} ACK en todos los demás casos.
 */

const SECRET = "test-webhook-secret-sacre";
const DATA_ID = "123456789";
const REQUEST_ID = "req-abc-123";
const TS = "1699999999";

function sign(dataId: string, requestId: string, ts: string, secret = SECRET): string {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  return createHmac("sha256", secret).update(manifest).digest("hex");
}

function makeRequest(body: unknown, headers: Record<string, string>): NextRequest {
  return new NextRequest("http://localhost/api/webhooks/mercadopago", {
    method: "POST",
    headers: new Headers(headers),
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function validHeaders(dataId = DATA_ID): Record<string, string> {
  return {
    "content-type": "application/json",
    "x-signature": `ts=${TS},v1=${sign(dataId, REQUEST_ID, TS)}`,
    "x-request-id": REQUEST_ID,
  };
}

function validPaymentBody() {
  return {
    type: "payment",
    data: { id: DATA_ID },
  };
}

/** Mock chainable del cliente Supabase con estadísticas de llamadas. */
function makeSupabaseMock(opts: {
  existingOrder?: Record<string, unknown> | null;
  dupNotification?: Record<string, unknown> | null;
  singleRejects?: boolean;
}) {
  const calls: Record<string, number> = {};
  const mock = {
    _calls: calls,
    from(table: string) {
      calls[table] = (calls[table] || 0) + 1;
      if (table === "orders") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: opts.singleRejects
            ? vi.fn().mockRejectedValue(new Error("DB down"))
            : vi.fn().mockResolvedValue({ data: opts.existingOrder ?? null }),
          update: vi.fn().mockReturnThis(),
        };
      }
      if (table === "notifications") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi
            .fn()
            .mockResolvedValue({ data: opts.dupNotification ?? null }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    },
  };
  return mock;
}

function mpPaymentResponse(overrides: Record<string, unknown> = {}) {
  return {
    ok: true,
    json: async () => ({
      id: DATA_ID,
      status: "approved",
      external_reference: "SACRE-0001",
      payer: { email: "cliente@test.com" },
      ...overrides,
    }),
  };
}

describe("POST /api/webhooks/mercadopago", () => {
  let mod: typeof import("./route");
  let fetchMock: ReturnType<typeof vi.fn>;
  let emailMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    process.env.MERCADOPAGO_WEBHOOK_SECRET = SECRET;
    process.env.MERCADOPAGO_ACCESS_TOKEN = "TEST-mp-token";
    process.env.RESEND_API_KEY = "re-test-key";
    fetchMock = vi.fn();
    emailMock = vi.fn().mockResolvedValue(undefined);
    mod = await import("./route");
    // Reset del seam de DI entre tests
    mod.__testDeps.fetchImpl = undefined;
    mod.__testDeps.createClientImpl = undefined;
    mod.__testDeps.sendEmailImpl = undefined;
  });

  afterEach(() => {
    delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
    delete process.env.MERCADOPAGO_ACCESS_TOKEN;
    delete process.env.RESEND_API_KEY;
    vi.restoreAllMocks();
  });

  function wire(deps: WebhookDeps) {
    Object.assign(mod.__testDeps, deps);
  }

  it("401 si falta el header x-signature", async () => {
    const supa = makeSupabaseMock({});
    wire({
      fetchImpl: fetchMock as unknown as typeof fetch,
      createClientImpl: () => supa as any,
      sendEmailImpl: emailMock as any,
    });
    const req = makeRequest(validPaymentBody(), { "content-type": "application/json" });
    const res = await mod.POST(req);
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("400 si el body no es JSON válido", async () => {
    wire({
      fetchImpl: fetchMock as unknown as typeof fetch,
      createClientImpl: () => makeSupabaseMock({}) as any,
      sendEmailImpl: emailMock as any,
    });
    const req = makeRequest("not-json{{", validHeaders());
    const res = await mod.POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid JSON body");
  });

  it("ACK 200 {success:true} para tópicos non-payment sin tocar MP ni DB", async () => {
    const supa = makeSupabaseMock({});
    wire({
      fetchImpl: fetchMock as unknown as typeof fetch,
      createClientImpl: () => supa as any,
      sendEmailImpl: emailMock as any,
    });
    const req = makeRequest(
      { type: "merchant_order", data: { id: DATA_ID } },
      validHeaders()
    );
    const res = await mod.POST(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(supa._calls["orders"]).toBeUndefined();
  });

  it("401 si la firma no corresponde al body (v1 de otro payment)", async () => {
    wire({
      fetchImpl: fetchMock as unknown as typeof fetch,
      createClientImpl: () => makeSupabaseMock({}) as any,
      sendEmailImpl: emailMock as any,
    });
    const req = makeRequest(validPaymentBody(), validHeaders("999999"));
    const res = await mod.POST(req);
    expect(res.status).toBe(401);
  });

  it("procesa payment válido: fetch a MP + update + insert notification", async () => {
    fetchMock.mockResolvedValueOnce(mpPaymentResponse());
    const supa = makeSupabaseMock({ existingOrder: null, dupNotification: null });
    wire({
      fetchImpl: fetchMock as unknown as typeof fetch,
      createClientImpl: () => supa as any,
      sendEmailImpl: emailMock as any,
    });
    const req = makeRequest(validPaymentBody(), validHeaders());
    const res = await mod.POST(req);
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.mercadopago.com/v1/payments/${DATA_ID}`,
      expect.objectContaining({
        headers: { Authorization: "Bearer TEST-mp-token" },
      })
    );
    expect(supa._calls["orders"]).toBe(2); // select single + update
    expect(supa._calls["notifications"]).toBe(2); // select maybeSingle + insert
  });

  it("idempotencia: payment ya registrado con mismo estado → no update ni notify", async () => {
    fetchMock.mockResolvedValueOnce(mpPaymentResponse());
    // El pedido ya tiene este payment_id con status approved (reintento de MP).
    const supa = makeSupabaseMock({
      existingOrder: {
        payment_id: DATA_ID,
        payment_status: "approved",
        guest_email: "cliente@test.com",
        customer_email: null,
      },
      dupNotification: null,
    });
    wire({
      fetchImpl: fetchMock as unknown as typeof fetch,
      createClientImpl: () => supa as any,
      sendEmailImpl: emailMock as any,
    });
    const req = makeRequest(validPaymentBody(), validHeaders());
    const res = await mod.POST(req);
    expect(res.status).toBe(200);
    // alreadyHandled corta antes del insert y del email.
    expect(supa._calls["notifications"]).toBeUndefined();
    expect(emailMock).not.toHaveBeenCalled();
  });

  it("request_id ausente en header se toma del body (fallback data.request_id)", async () => {
    const body = {
      type: "payment",
      data: { id: DATA_ID, request_id: REQUEST_ID },
    };
    // Firma construida con el request_id del BODY (el header no viene).
    const v1 = sign(DATA_ID, REQUEST_ID, TS);
    fetchMock.mockResolvedValueOnce(mpPaymentResponse());
    const supa = makeSupabaseMock({ existingOrder: null });
    wire({
      fetchImpl: fetchMock as unknown as typeof fetch,
      createClientImpl: () => supa as any,
      sendEmailImpl: emailMock as any,
    });
    const req = makeRequest(body, {
      "content-type": "application/json",
      "x-signature": `ts=${TS},v1=${v1}`,
    });
    const res = await mod.POST(req);
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("MP fetch responde sin external_reference → ACK sin tocar DB", async () => {
    fetchMock.mockResolvedValueOnce(
      mpPaymentResponse({ external_reference: undefined })
    );
    const supa = makeSupabaseMock({});
    wire({
      fetchImpl: fetchMock as unknown as typeof fetch,
      createClientImpl: () => supa as any,
      sendEmailImpl: emailMock as any,
    });
    const req = makeRequest(validPaymentBody(), validHeaders());
    const res = await mod.POST(req);
    expect(res.status).toBe(200);
    expect(supa._calls["orders"]).toBeUndefined();
  });

  it("error de DB en update → ACK 200 igual (no rompe el bucle de MP)", async () => {
    fetchMock.mockResolvedValueOnce(mpPaymentResponse());
    const supa = makeSupabaseMock({ existingOrder: null, singleRejects: true });
    wire({
      fetchImpl: fetchMock as unknown as typeof fetch,
      createClientImpl: () => supa as any,
      sendEmailImpl: emailMock as any,
    });
    const req = makeRequest(validPaymentBody(), validHeaders());
    const res = await mod.POST(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });
});
