import { describe, expect, it, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

// Route-level pins for POST /api/orders/create — ORN-127 T6.
//
// Two contracts that only exist at the route layer:
//   1. Demo mode: createServerClient() throws (no Supabase config) → the
//      route still answers 200 with the mock response. Existing contract.
//   2. The route actually CALLS resolveAndValidateItems before inserting:
//      an unknown slug must answer 400 unknown_product and never reach the
//      orders insert. Without this pin, removing the wiring would keep the
//      lib tests green while the oversell window reopens.
//
// createServerClient is mocked at module level; the DB shape is the same
// fake seam as lib/orders/create.test.ts, extended with the insert chains
// the route uses (orders / order_items).

const createServerClientMock = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createServerClient: (...args: unknown[]) => createServerClientMock(...args),
}));

interface QueryResult {
  data: unknown | null;
  error: { message: string } | null;
}

interface RecordedInsert {
  table: string;
  payload: unknown;
}

function makeFakeClient(results: QueryResult[], inserts: RecordedInsert[]) {
  let next = 0;
  const take = (): QueryResult =>
    results[Math.min(next, results.length - 1)];
  const chainFor = (table: string): Record<string, unknown> => {
    const chain: Record<string, unknown> = {};
    chain.select = () => chain;
    chain.in = () => chain;
    chain.single = () => chain;
    chain.insert = (payload: unknown) => {
      inserts.push({ table, payload });
      return chain;
    };
    chain.then = (
      resolve: (r: QueryResult) => void,
      reject?: (e: unknown) => unknown
    ) => {
      const r = take();
      next++;
      // The chain object is not a real promise; supabase-js callers await
      // it, and this fake resolves through then() on the next tick.
      Promise.resolve().then(() => (r.error ? reject?.(r.error) : resolve(r)));
      return undefined;
    };
    return chain;
  };
  return {
    from: vi.fn((table: string) => chainFor(table)),
  } as unknown as SupabaseClient;
}

const BASE_BODY = {
  order_number: "SACRE-TEST-1",
  customer: {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
  },
  shipping: { method: "pickup" },
  payment_method: "mercadopago",
  items: [
    { product_id: "product-a", productName: "Product A", quantity: 2, price: 1 },
  ],
  subtotal: 2,
  total: 2,
};

function request(body: unknown): Request {
  return new Request("http://localhost/api/orders/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders/create (route pins)", () => {
  let inserts: RecordedInsert[];

  beforeEach(() => {
    vi.resetModules();
    createServerClientMock.mockReset();
    inserts = [];
  });

  it("demo mode: unconfigured Supabase answers 200 with the mock response", async () => {
    createServerClientMock.mockImplementation(() => {
      throw new Error("Missing Supabase configuration");
    });
    const { POST } = await import("./route");
    const res = await POST(request(BASE_BODY) as never);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(String(json.message)).toContain("demo");
    expect(inserts.length).toBe(0);
  });

  it("unknown slug answers 400 unknown_product and never inserts an order", async () => {
    createServerClientMock.mockReturnValue(
      makeFakeClient([{ data: [], error: null }], inserts)
    );
    const { POST } = await import("./route");
    const res = await POST(request(BASE_BODY) as never);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.code).toBe("unknown_product");
    expect(inserts.length).toBe(0); // validation happened BEFORE any insert
  });

  it("server subtotal/total override client values in the orders insert", async () => {
    // Follow-up ORN-127 T4 NOTE: body.subtotal/total must NOT be trusted for
    // the orders row. The server recomputes from DB prices; the orders insert
    // must carry the server values, and a mismatched client total must be
    // logged (warn) for observability instead of silently accepted.
    const UUID_A = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    createServerClientMock.mockReturnValue(
      makeFakeClient(
        [
          {
            data: [
              {
                id: UUID_A,
                slug: "product-a",
                name: "Product A",
                price: 5000,
                stock: 10,
                is_active: true,
              },
            ],
            error: null,
          },
          { data: { id: "order-1" }, error: null },
          { data: null, error: null },
        ],
        inserts
      )
    );
    const { POST } = await import("./route");
    // Client lies: subtotal 2 / total 2, but DB says 2 × 5000 = 10000.
    const res = await POST(request(BASE_BODY) as never);
    expect(res.status).toBe(200);
    const orderInsert = inserts.find((i) => i.table === "orders");
    expect(orderInsert).toBeDefined();
    const payload = orderInsert?.payload as { subtotal: number; total: number };
    expect(payload.subtotal).toBe(10000); // DB-recomputed, NOT 2
    expect(payload.total).toBe(10000); // shipping 0 in fixture (pickup)
    expect(warnSpy).toHaveBeenCalled(); // mismatch logged
    warnSpy.mockRestore();
  });

  it("tampered client price never reaches the insert payload (DB price wins)", async () => {
    const UUID_A = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";
    createServerClientMock.mockReturnValue(
      makeFakeClient(
        [
          {
            data: [
              {
                id: UUID_A,
                slug: "product-a",
                name: "Product A",
                price: 5000,
                stock: 10,
                is_active: true,
              },
            ],
            error: null,
          },
          { data: { id: "order-1" }, error: null },
          { data: null, error: null },
        ],
        inserts
      )
    );
    const { POST } = await import("./route");
    const res = await POST(request(BASE_BODY) as never); // client price = 1
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    const itemsInsert = inserts.find((i) => i.table === "order_items");
    expect(itemsInsert).toBeDefined();
    const inserted = JSON.stringify(itemsInsert?.payload);
    expect(inserted).toContain(String(5000)); // DB unit price wins
    expect(inserted).toContain(UUID_A); // resolved uuid, not the slug
    expect(inserted).not.toContain("product-a"); // slug must not reach the FK
  });
});
