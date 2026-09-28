import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getProducts,
  getProductById,
  getProductsByCategory,
  mapRowToProduct,
} from "./catalog";

// ---------------------------------------------------------------------
// Fake Supabase client (seam DI). Records every builder call so the tests
// PIN the query shape (table, columns, eq args, order, limit) — a refactor
// that drops the `.eq("is_active", true)` pushdown or hits the wrong table
// must fail here, not just look green (dual-judge H2 fix).
// ---------------------------------------------------------------------
interface QueryResult {
  data: unknown | null;
  error: { message: string } | null;
}

interface QueryCall {
  table: string;
  columns?: string;
  eq: [string, unknown][];
  order?: [string, { ascending?: boolean }];
  limit?: number;
}

function makeFakeClient(result: QueryResult, calls: QueryCall[]) {
  const makeChain = (call: QueryCall): Record<string, unknown> => {
    const chain: Record<string, unknown> = {
      then: (onFulfilled: (r: QueryResult) => unknown) =>
        Promise.resolve(result).then(onFulfilled),
      catch: (onRejected: (e: unknown) => unknown) =>
        Promise.resolve(result).catch(onRejected),
      eq: (col: string, val: unknown) => {
        call.eq.push([col, val]);
        return chain;
      },
      order: (col: string, opts?: { ascending?: boolean }) => {
        call.order = [col, opts ?? {}];
        return chain;
      },
      limit: (n: number) => {
        call.limit = n;
        return chain;
      },
    };
    return chain;
  };
  const client = {
    from: vi.fn((table: string) => {
      const call: QueryCall = { table, eq: [] };
      calls.push(call);
      return {
        select: (columns: string) => {
          call.columns = columns;
          return makeChain(call) as unknown as Record<string, unknown>;
        },
      };
    }),
  };
  return client as unknown as SupabaseClient;
}

function lastCall(calls: QueryCall[]): QueryCall {
  return calls[calls.length - 1];
}

const EXPECTED_COLUMNS =
  "id,slug,name,description,price,compare_at_price,category,stock,sku,images,is_active,is_featured,tags,created_at,updated_at";

// Row shape mirroring public.products (DB viva, migration 0001_init.sql)
const baseRow = {
  id: "11111111-2222-3333-4444-555555555555",
  slug: "caja-seleccion",
  name: "Caja Selección de Autor",
  description: "Doce piezas únicas pintadas a mano.",
  price: 18000,
  compare_at_price: null,
  category: "bombones",
  stock: 15,
  sku: "SACRE-CAJA-001",
  images: ["/images/bombones.png"],
  is_active: true,
  is_featured: true,
  tags: ["destacado"],
  created_at: "2026-09-27T00:00:00Z",
  updated_at: "2026-09-27T00:00:00Z",
};

// ---------------------------------------------------------------------
// mapRowToProduct
// ---------------------------------------------------------------------
describe("mapRowToProduct", () => {
  it("derives `image` from images[0] for backwards compatibility", () => {
    const p = mapRowToProduct(baseRow);
    expect(p.image).toBe("/images/bombones.png");
  });

  it("maps is_featured → featured and keeps slug as id for routes", () => {
    const p = mapRowToProduct(baseRow);
    expect(p.featured).toBe(true);
    expect(p.id).toBe("caja-seleccion");
  });

  it("keeps price, stock, category, tags from the row", () => {
    const p = mapRowToProduct(baseRow);
    expect(p.price).toBe(18000);
    expect(p.stock).toBe(15);
    expect(p.category).toBe("bombones");
    expect(p.tags).toEqual(["destacado"]);
  });

  it("falls back to empty image when images array is empty", () => {
    const p = mapRowToProduct({ ...baseRow, images: [] });
    expect(p.image).toBe("");
  });

  it("falls back to empty image when images is null", () => {
    const p = mapRowToProduct({ ...baseRow, images: null });
    expect(p.image).toBe("");
  });
});

// ---------------------------------------------------------------------
// getProducts
// ---------------------------------------------------------------------
describe("getProducts", () => {
  it("returns mapped active products ordered as delivered", async () => {
    const calls: QueryCall[] = [];
    const rows = [
      baseRow,
      { ...baseRow, id: "9999", slug: "trufa-negra", name: "Truffles Noire" },
    ];
    const client = makeFakeClient({ data: rows, error: null }, calls);
    const products = await getProducts(client);
    expect(products).toHaveLength(2);
    expect(products[0].name).toBe("Caja Selección de Autor");
    expect(products[1].slug).toBe("trufa-negra");
  });

  it("queries the products table with the exact column set and active filter", async () => {
    const calls: QueryCall[] = [];
    const client = makeFakeClient({ data: [baseRow], error: null }, calls);
    await getProducts(client);
    const c = lastCall(calls);
    expect(c.table).toBe("products");
    expect(c.columns).toBe(EXPECTED_COLUMNS);
    expect(c.eq).toContainEqual(["is_active", true]);
    expect(c.order).toEqual(["created_at", { ascending: true }]);
  });

  it("returns empty list on query error (DB caída) — no crash", async () => {
    const calls: QueryCall[] = [];
    const client = makeFakeClient({ data: null, error: { message: "connection refused" } }, calls);
    const products = await getProducts(client);
    expect(products).toEqual([]);
  });

  it("returns empty list when data is null without error", async () => {
    const calls: QueryCall[] = [];
    const client = makeFakeClient({ data: null, error: null }, calls);
    const products = await getProducts(client);
    expect(products).toEqual([]);
  });

  it("returns empty list when client is null (Supabase unconfigured — demo mode)", async () => {
    const products = await getProducts(null);
    expect(products).toEqual([]);
  });

  it("filters inactive products out (is_active=false) even if the pushdown leaks them", async () => {
    const calls: QueryCall[] = [];
    const rows = [
      baseRow,
      { ...baseRow, slug: "oculto", is_active: false },
    ];
    const client = makeFakeClient({ data: rows, error: null }, calls);
    const products = await getProducts(client);
    expect(products).toHaveLength(1);
    expect(products[0].slug).toBe("caja-seleccion");
  });
});

// ---------------------------------------------------------------------
// getProductById
// ---------------------------------------------------------------------
describe("getProductById", () => {
  it("finds by slug (id) and returns the mapped product", async () => {
    const calls: QueryCall[] = [];
    const client = makeFakeClient({ data: [baseRow], error: null }, calls);
    const p = await getProductById(client, "caja-seleccion");
    expect(p?.id).toBe("caja-seleccion");
    expect(p?.name).toBe("Caja Selección de Autor");
  });

  it("pushes eq(slug) + eq(is_active) + limit(1) to the query", async () => {
    const calls: QueryCall[] = [];
    const client = makeFakeClient({ data: [baseRow], error: null }, calls);
    await getProductById(client, "caja-seleccion");
    const c = lastCall(calls);
    expect(c.table).toBe("products");
    expect(c.eq).toContainEqual(["slug", "caja-seleccion"]);
    expect(c.eq).toContainEqual(["is_active", true]);
    expect(c.limit).toBe(1);
  });

  it("returns null when the product does not exist", async () => {
    const calls: QueryCall[] = [];
    const client = makeFakeClient({ data: [], error: null }, calls);
    const p = await getProductById(client, "no-existe");
    expect(p).toBeNull();
  });

  it("returns null on DB error — never throws", async () => {
    const calls: QueryCall[] = [];
    const client = makeFakeClient({ data: null, error: { message: "timeout" } }, calls);
    const p = await getProductById(client, "caja-seleccion");
    expect(p).toBeNull();
  });

  it("returns null when client is null (Supabase unconfigured)", async () => {
    const p = await getProductById(null, "caja-seleccion");
    expect(p).toBeNull();
  });

  it("returns null when first row is inactive", async () => {
    const calls: QueryCall[] = [];
    const client = makeFakeClient({ data: [{ ...baseRow, is_active: false }], error: null }, calls);
    const p = await getProductById(client, "caja-seleccion");
    expect(p).toBeNull();
  });
});

// ---------------------------------------------------------------------
// getProductsByCategory
// ---------------------------------------------------------------------
describe("getProductsByCategory", () => {
  it("returns only products of the requested category", async () => {
    const calls: QueryCall[] = [];
    const rows = [
      { ...baseRow, slug: "a", category: "bombones" },
      { ...baseRow, slug: "b", category: "tabletas" },
    ];
    const client = makeFakeClient({ data: rows, error: null }, calls);
    const products = await getProductsByCategory(client, "bombones");
    expect(products).toHaveLength(1);
    expect(products[0].slug).toBe("a");
  });

  it("pushes eq(category) + eq(is_active) to the query", async () => {
    const calls: QueryCall[] = [];
    const client = makeFakeClient({ data: [baseRow], error: null }, calls);
    await getProductsByCategory(client, "bombones");
    const c = lastCall(calls);
    expect(c.table).toBe("products");
    expect(c.eq).toContainEqual(["category", "bombones"]);
    expect(c.eq).toContainEqual(["is_active", true]);
  });

  it("returns empty list on error", async () => {
    const calls: QueryCall[] = [];
    const client = makeFakeClient({ data: null, error: { message: "boom" } }, calls);
    const products = await getProductsByCategory(client, "bombones");
    expect(products).toEqual([]);
  });

  it("returns empty list when client is null (Supabase unconfigured)", async () => {
    const products = await getProductsByCategory(null, "bombones");
    expect(products).toEqual([]);
  });
});
