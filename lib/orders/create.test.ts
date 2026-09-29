import { describe, expect, it, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveAndValidateItems, type OrderItemInput } from "./create";

// ---------------------------------------------------------------------
// Server-side validation of /api/orders/create items — ORN-127 F3.
//
// Fake Supabase client (seam DI, same pattern as lib/catalog.test.ts).
// Each `from()` call consumes the next queued result, so multi-query flows
// (slug lookup + uuid lookup) are pinned independently. Tests PIN the
// query shape: table, columns, in(column, values). A refactor that trusts
// the client price, hits the wrong column, or skips the lookup must fail
// here, not just look green.
// ---------------------------------------------------------------------
const UUID_A = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";

interface QueryResult {
  data: unknown | null;
  error: { message: string } | null;
}

interface QueryCall {
  table: string;
  columns?: string;
  in?: [string, unknown[]];
}

function makeFakeClient(results: QueryResult[], calls: QueryCall[]) {
  let next = 0;
  const makeChain = (call: QueryCall): Record<string, unknown> => {
    const chain: Record<string, unknown> = {};
    chain.select = (columns?: string) => {
      call.columns = columns;
      return chain;
    };
    chain.in = (column: string, values: unknown[]) => {
      call.in = [column, values];
      return chain;
    };
    chain.then = (resolve: (r: QueryResult) => void) => {
      resolve(results[Math.min(next, results.length - 1)]);
      next++;
    };
    return chain;
  };
  return {
    from: vi.fn((table: string) => {
      const call: QueryCall = { table };
      calls.push(call);
      return makeChain(call);
    }),
  } as unknown as SupabaseClient;
}

// DB row shape for the products lookup (subset of the products table).
interface FakeProductRow {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  is_active: boolean;
}

function row(overrides: Partial<FakeProductRow> = {}): FakeProductRow {
  return {
    id: UUID_A,
    slug: "product-a",
    name: "Product A",
    price: 5000,
    stock: 10,
    is_active: true,
    ...overrides,
  };
}

function item(overrides: Partial<OrderItemInput> = {}): OrderItemInput {
  return {
    product_id: "product-a", // checkout sends the slug as product_id (ORN-126)
    productName: "Product A",
    quantity: 2,
    price: 5000, // client-sent unit price — must be IGNORED server-side
    ...overrides,
  };
}

describe("resolveAndValidateItems", () => {
  let calls: QueryCall[];

  beforeEach(() => {
    calls = [];
  });

  it("RED anchor: module exists and exports resolveAndValidateItems", () => {
    expect(typeof resolveAndValidateItems).toBe("function");
  });

  it("resolves slug → uuid and unit price from DB, never from client", async () => {
    const client = makeFakeClient(
      [{ data: [row()], error: null }],
      calls
    );
    const res = await resolveAndValidateItems(client, [item()]);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.items).toEqual([
      {
        product_id: UUID_A,
        product_name: "Product A",
        quantity: 2,
        unit_price: 5000,
        subtotal: 10000,
      },
    ]);
    expect(res.subtotal).toBe(10000);
    // Query shape pinned: products table, lookup by slug.
    expect(calls.length).toBe(1);
    expect(calls[0].table).toBe("products");
    expect(calls[0].columns).toContain("id");
    expect(calls[0].columns).toContain("slug");
    expect(calls[0].columns).toContain("price");
    expect(calls[0].columns).toContain("stock");
    expect(calls[0].columns).toContain("is_active");
    expect(calls[0].in?.[0]).toBe("slug");
    expect(calls[0].in?.[1]).toContain("product-a");
  });

  it("server price wins: tampered client price never reaches the result", async () => {
    const client = makeFakeClient(
      [{ data: [row({ price: 5000 })], error: null }],
      calls
    );
    const res = await resolveAndValidateItems(client, [
      item({ price: 1 }), // tampered: 1 peso for a 5000-peso product
    ]);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.items[0].unit_price).toBe(5000);
    expect(res.items[0].subtotal).toBe(10000);
    expect(res.subtotal).toBe(10000);
  });

  it("passthrough: uuid product_id is looked up by id, not slug", async () => {
    const client = makeFakeClient(
      [{ data: [row({ id: UUID_A })], error: null }],
      calls
    );
    const res = await resolveAndValidateItems(client, [
      item({ product_id: UUID_A }),
    ]);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.items[0].product_id).toBe(UUID_A);
    expect(calls.length).toBe(1);
    expect(calls[0].in?.[0]).toBe("id");
    expect(calls[0].in?.[1]).toContain(UUID_A);
  });

  it("mixed slug + uuid keys: two lookups, one per column", async () => {
    const client = makeFakeClient(
      [
        { data: [row({ slug: "product-a" })], error: null },
        { data: [row({ id: UUID_A, slug: "product-b", name: "Product B", price: 1500 })], error: null },
      ],
      calls
    );
    const res = await resolveAndValidateItems(client, [
      item(),
      item({ product_id: UUID_A, quantity: 1 }),
    ]);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.items.length).toBe(2);
    expect(res.subtotal).toBe(5000 * 2 + 1500);
    expect(calls.length).toBe(2);
    expect(calls[0].in?.[0]).toBe("slug");
    expect(calls[1].in?.[0]).toBe("id");
  });

  it("rejects unknown slug with 400 unknown_product naming the key", async () => {
    const client = makeFakeClient([{ data: [], error: null }], calls);
    const res = await resolveAndValidateItems(client, [
      item({ product_id: "ghost-slug" }),
    ]);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.status).toBe(400);
    expect(res.code).toBe("unknown_product");
    expect(res.message).toContain("ghost-slug");
  });

  it("rejects item without product_id with 400 unknown_product", async () => {
    const client = makeFakeClient([{ data: [], error: null }], calls);
    const res = await resolveAndValidateItems(client, [
      item({ product_id: undefined }),
    ]);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.status).toBe(400);
    expect(res.code).toBe("unknown_product");
  });

  it("rejects inactive product with 400 product_inactive", async () => {
    const client = makeFakeClient(
      [{ data: [row({ is_active: false })], error: null }],
      calls
    );
    const res = await resolveAndValidateItems(client, [item()]);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.status).toBe(400);
    expect(res.code).toBe("product_inactive");
  });

  it("rejects insufficient stock with 400 insufficient_stock", async () => {
    const client = makeFakeClient(
      [{ data: [row({ stock: 1 })], error: null }],
      calls
    );
    const res = await resolveAndValidateItems(client, [item({ quantity: 2 })]);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.status).toBe(400);
    expect(res.code).toBe("insufficient_stock");
    expect(res.message).toContain("Product A");
  });

  it("aggregates quantity of duplicated slug items before stock check", async () => {
    const client = makeFakeClient(
      [{ data: [row({ stock: 3 })], error: null }],
      calls
    );
    const res = await resolveAndValidateItems(client, [
      item({ quantity: 2 }),
      item({ quantity: 2 }),
    ]);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.code).toBe("insufficient_stock");
  });

  it("allows stock exactly equal to requested quantity", async () => {
    const client = makeFakeClient(
      [{ data: [row({ stock: 2 })], error: null }],
      calls
    );
    const res = await resolveAndValidateItems(client, [item({ quantity: 2 })]);
    expect(res.ok).toBe(true);
  });

  it("rejects non-positive quantity with 400 invalid_quantity before any query", async () => {
    const client = makeFakeClient([{ data: [row()], error: null }], calls);
    const res = await resolveAndValidateItems(client, [
      item({ quantity: 0 }),
    ]);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.status).toBe(400);
    expect(res.code).toBe("invalid_quantity");
    expect(calls.length).toBe(0); // fail fast, no wasted DB round-trip
  });

  it("returns 503 db_unavailable on query error, never throws", async () => {
    const client = makeFakeClient(
      [{ data: null, error: { message: "connection refused" } }],
      calls
    );
    const res = await resolveAndValidateItems(client, [item()]);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.status).toBe(503);
    expect(res.code).toBe("db_unavailable");
  });

  it("returns 503 db_unavailable when client is null (unconfigured)", async () => {
    const res = await resolveAndValidateItems(null, [item()]);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.status).toBe(503);
    expect(res.code).toBe("db_unavailable");
  });

  it("keeps input order in resolved items", async () => {
    const client = makeFakeClient(
      [
        {
          data: [
            row({ slug: "product-b", name: "Product B", price: 1500 }),
            row({ slug: "product-a", name: "Product A" }),
          ],
          error: null,
        },
      ],
      calls
    );
    const res = await resolveAndValidateItems(client, [
      item({ product_id: "product-a", quantity: 1 }),
      item({ product_id: "product-b", quantity: 3 }),
    ]);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.items[0].product_name).toBe("Product A");
    expect(res.items[1].product_name).toBe("Product B");
    expect(res.subtotal).toBe(5000 * 1 + 1500 * 3);
  });
});
