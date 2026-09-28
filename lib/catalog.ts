// Catalog access from server components — ORN-126 F2: catálogo real desde DB.
//
// Design notes:
//   - Functions take a SupabaseClient (service role via lib/supabase/client,
//     matching the RLS design in 0001_init.sql: checkout/admin use service
//     role). Tests inject a fake client cast to the parameter type.
//   - Rows come from public.products (migration 0001_init.sql). We map the DB
//     row to the frontend Product shape from lib/supabase/types, deriving the
//     legacy `image` field from images[0] so existing components keep working.
//   - `slug` becomes the public route id (`/productos/[slug]`), matching the
//     seeded slugs that the old mock used as ids — zero route churn.
//   - Degradation contract (dual-judge H1 fix): when Supabase is not
//     configured at all, catalog functions return empty/null instead of
//     letting createServerClient() throw — public pages must render (empty)
//     and the build must prerender without secrets, mirroring the documented
//     demo-mode fallback of app/api/orders/create. Query-level errors inside
//     an existing client are also swallowed into empty results, with a
//     console.error so an outage is observable, not silent.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "./supabase/types";
import { createServerClient, isSupabaseConfigured } from "./supabase/client";

export type CatalogProduct = Product & { slug: string; featured: boolean };

export interface CatalogRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category: string | null;
  stock: number;
  sku: string | null;
  images: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

/** DB row → frontend Product. Legacy `image` derived from images[0]. */
export function mapRowToProduct(row: CatalogRow): CatalogProduct {
  const images = row.images ?? [];
  return {
    id: row.slug, // route id stays the slug (mock compatibility)
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    compare_at_price: row.compare_at_price,
    category: row.category,
    stock: row.stock,
    sku: row.sku,
    images,
    is_active: row.is_active,
    is_featured: row.is_featured,
    tags: row.tags,
    created_at: row.created_at,
    updated_at: row.updated_at,
    image: images.length > 0 ? images[0] : "",
    featured: row.is_featured,
  };
}

const CATALOG_COLUMNS =
  "id,slug,name,description,price,compare_at_price,category,stock,sku,images,is_active,is_featured,tags,created_at,updated_at";

function rowsOf(data: unknown): CatalogRow[] {
  return Array.isArray(data) ? (data as CatalogRow[]) : [];
}

/**
 * Client for catalog reads, or null when Supabase is not configured
 * (demo mode). Callers degrade to empty results on null.
 */
export function getCatalogClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  try {
    return createServerClient();
  } catch {
    return null;
  }
}

/** All active products, insertion order. Degrades to [] when unconfigured/error. */
export async function getProducts(client: SupabaseClient | null): Promise<CatalogProduct[]> {
  if (!client) return [];
  try {
    const { data, error } = await client
      .from("products")
      .select(CATALOG_COLUMNS)
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("catalog: getProducts query failed:", error.message);
      return [];
    }
    return rowsOf(data).filter((r) => r.is_active).map(mapRowToProduct);
  } catch (e) {
    console.error("catalog: getProducts threw:", e);
    return [];
  }
}

/** One active product by slug (route id); null when missing/inactive/unconfigured/error. */
export async function getProductById(
  client: SupabaseClient | null,
  slug: string,
): Promise<CatalogProduct | null> {
  if (!client) return null;
  try {
    const { data, error } = await client
      .from("products")
      .select(CATALOG_COLUMNS)
      .eq("slug", slug)
      .eq("is_active", true)
      .limit(1);
    if (error) {
      console.error("catalog: getProductById query failed:", error.message);
      return null;
    }
    const first = rowsOf(data)[0];
    if (!first || !first.is_active) return null;
    return mapRowToProduct(first);
  } catch (e) {
    console.error("catalog: getProductById threw:", e);
    return null;
  }
}

/** Active products of one category (e.g. "bombones").
 *  Defensive: filters by category in the mapping layer too — the contract
 *  holds even if the client ignores the eq() pushdown. */
export async function getProductsByCategory(
  client: SupabaseClient | null,
  category: string,
): Promise<CatalogProduct[]> {
  if (!client) return [];
  try {
    const { data, error } = await client
      .from("products")
      .select(CATALOG_COLUMNS)
      .eq("category", category)
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("catalog: getProductsByCategory query failed:", error.message);
      return [];
    }
    return rowsOf(data)
      .filter((r) => r.is_active)
      .filter((r) => r.category === category)
      .map(mapRowToProduct);
  } catch (e) {
    console.error("catalog: getProductsByCategory threw:", e);
    return [];
  }
}
