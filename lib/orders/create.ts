// Server-side order item validation — ORN-127 F3.
//
// Why this exists (judge H3 from ORN-126 dual review + latent P0):
//   - app/api/orders/create trusted item.price/quantity from the client, so a
//     tampered checkout could buy at price=1 or oversell stale stock (ISR
//     revalidate=300 keeps client stock up to 5 min old).
//   - Since ORN-126, checkout sends product_id = slug, but order_items has a
//     uuid FK → first real insert would fail. We resolve slug → uuid here.
//
// Contract (pinned by lib/orders/create.test.ts):
//   - DB price ALWAYS wins over the client price; subtotals are recomputed.
//   - Lookups are batched per key type: one `in(slug, …)` for slugs, one
//     `in(id, …)` for uuids. Result is a discriminated union and the function
//     never throws — DB errors surface as { ok:false, status:503 }.
//   - Quantity <= 0 fails fast (no query round-trip).
//   - Duplicate keys aggregate their quantities BEFORE the stock check, so a
//     cart with two lines of the same slug cannot oversell via repetition.

import type { SupabaseClient } from "@supabase/supabase-js";

export interface OrderItemInput {
  product_id?: string;
  productName?: string;
  quantity: number;
  price: number;
}

export interface ResolvedOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export type ResolvedItems =
  | { ok: true; items: ResolvedOrderItem[]; subtotal: number }
  | { ok: false; status: number; code: string; message: string };

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  is_active: boolean;
}

const PRODUCT_COLUMNS = "id,slug,name,price,stock,is_active";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const dbUnavailable = (message: string): ResolvedItems => ({
  ok: false,
  status: 503,
  code: "db_unavailable",
  message,
});

/**
 * Resolve and validate cart items against the live products table.
 *
 * Keys are resolved in two batched lookups when both kinds are present:
 * slugs via `in(slug, …)`, uuids via `in(id, …)`. Rows returned by either
 * lookup are used as the single source of truth for price, name, activity
 * and stock — the client-supplied `price` is ignored entirely.
 */
export async function resolveAndValidateItems(
  client: SupabaseClient | null,
  items: OrderItemInput[]
): Promise<ResolvedItems> {
  if (!client) return dbUnavailable("Base de datos no disponible");

  // Fail fast on non-positive quantity before touching the DB.
  for (const item of items) {
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      return {
        ok: false,
        status: 400,
        code: "invalid_quantity",
        message: `Cantidad inválida (${item.quantity})`,
      };
    }
  }

  // Collect distinct keys per column. A key is either a slug or a uuid;
  // the same product may arrive under both shapes in one cart.
  const slugKeys = new Set<string>();
  const uuidKeys = new Set<string>();
  for (const item of items) {
    const key = item.product_id;
    if (!key) continue;
    if (UUID_RE.test(key)) uuidKeys.add(key);
    else slugKeys.add(key);
  }

  // Two batched lookups, executed in slug-then-uuid order (the tests pin
  // calls[0] as the slug lookup and calls[1] as the uuid lookup).
  const bySlug = new Map<string, ProductRow>();
  const byUuid = new Map<string, ProductRow>();
  const rows: ProductRow[] = [];

  if (slugKeys.size > 0) {
    const { data, error } = await client
      .from("products")
      .select(PRODUCT_COLUMNS)
      .in("slug", Array.from(slugKeys));
    if (error) return dbUnavailable(error.message);
    const found = Array.isArray(data) ? (data as ProductRow[]) : [];
    rows.push(...found);
    for (const r of found) bySlug.set(r.slug, r);
  }

  if (uuidKeys.size > 0) {
    const { data, error } = await client
      .from("products")
      .select(PRODUCT_COLUMNS)
      .in("id", Array.from(uuidKeys));
    if (error) return dbUnavailable(error.message);
    const found = Array.isArray(data) ? (data as ProductRow[]) : [];
    rows.push(...found);
    for (const r of found) byUuid.set(r.id, r);
  }

  // Aggregate quantities per resolved row BEFORE the stock check so repeated
  // lines of the same product cannot oversell through repetition.
  const qtyByRow = new Map<string, number>();
  for (const item of items) {
    const row =
      (item.product_id && bySlug.get(item.product_id)) ||
      (item.product_id && byUuid.get(item.product_id)) ||
      undefined;
    if (!row) {
      return {
        ok: false,
        status: 400,
        code: "unknown_product",
        message: `Producto inexistente: ${item.product_id ?? "(sin id)"}`,
      };
    }
    qtyByRow.set(row.id, (qtyByRow.get(row.id) ?? 0) + item.quantity);
  }

  for (const row of rows) {
    const qty = qtyByRow.get(row.id);
    if (qty === undefined) continue;
    if (!row.is_active) {
      return {
        ok: false,
        status: 400,
        code: "product_inactive",
        message: `${row.name} no está disponible`,
      };
    }
    if (row.stock < qty) {
      return {
        ok: false,
        status: 400,
        code: "insufficient_stock",
        message: `Stock insuficiente para ${row.name} (disponible: ${row.stock})`,
      };
    }
  }

  // Build resolved items in the ORIGINAL input order; DB price wins.
  const resolved: ResolvedOrderItem[] = items.map((item) => {
    const row =
      (item.product_id && bySlug.get(item.product_id)) ||
      (item.product_id && byUuid.get(item.product_id)) ||
      undefined;
    const quantity = item.quantity;
    const unit_price = row!.price;
    return {
      product_id: row!.id,
      product_name: row!.name,
      quantity,
      unit_price,
      subtotal: unit_price * quantity,
    };
  });

  const subtotal = resolved.reduce((acc, r) => acc + r.subtotal, 0);
  return { ok: true, items: resolved, subtotal };
}
