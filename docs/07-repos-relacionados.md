# Repos relacionados — SACRÉ

> Solo documentación (2026-09-15). No se tocó código. Búsqueda web: "sacre shop ecommerce similar" + starters open source afines al stack (Next.js App Router + Supabase).

## Nota previa: "Sacre Shop"

No se encontró un ecommerce open source llamado exactamente "Sacre Shop" emparentado con este repo. Los resultados de "Sacre/Sacré shop" son tiendas homónimas sin relación técnica (marroquinería, indumentaria, merchandising del Sacré-Cœur). Lo útil como referencia son **starters y plataformas ecommerce open source con stack comparable**.

## Stack de SACRÉ (resumen)

Next.js 16 (App Router) + React 19 + Tailwind v4 + Supabase (`supabase-js`) + Mercado Pago Checkout Pro (fetch directo) + Resend (API routes). Catálogo mock en `lib/data.ts`, tipos DB-ready en `lib/supabase/types.ts`. Detalle en `docs/stack-framework.md`.

## Repos de referencia

| Repo | URL | Stack | Qué mirar para SACRÉ |
|---|---|---|---|
| Vercel Commerce (`vercel/commerce`) | https://github.com/vercel/commerce | Next.js App Router + Shopify (headless) | Estructura de storefront (PDP, carrito, search), SEO/metadata, ISR. Referencia de UX aunque el backend sea Shopify y no Supabase. |
| Medusa + Next.js storefront | https://github.com/medusajs/medusa | Medusa (Node) + Next.js starter | Modelo de órdenes/carrito headless, regiones/monedas, webhooks de pago. Útil si SACRÉ migra de mock a backend real. |
| `MarcosCamara01/ecommerce-template` | https://github.com/MarcosCamara01/ecommerce-template | Next.js 16 + React 19 + Tailwind + Drizzle + Supabase + Better Auth + Stripe + TanStack Query | **El más cercano al stack SACRÉ**: Next 16 + Supabase como en este repo. Comparar auth, capa de datos y checkout (acá Stripe vs Mercado Pago en SACRÉ). |
| Next Store (Next.js + Stripe + Supabase) | https://medium.com/@simonsruggi/next-store-a-minimal-e-commerce-template-using-nextjs-stripe-and-supabase-d3ef3e994063 | Next.js + Supabase + Stripe | Template mínimo productivo: catálogo, carrito, checkout. Bueno como checklist de "mínimo viable" (SACRÉ ya cubre gran parte en modo demo). |
| Spree Commerce + Next.js starter | https://spreecommerce.org/15-amazing-ecommerce-websites-built-with-next-js/ | Spree (Rails) + Next.js | Ejemplos de storefronts Next.js reales + starter dedicado. Ideas de home/categorías para marca estética como SACRÉ. |
| GreatStack e-commerce Next.js (tutorial) | https://www.youtube.com/watch?v=nxK_TCt2pKw | Next.js full-stack (código en github.com, link en la descripción) | Recorrido didáctico catálogo→carrito→órdenes. Útil para onboardear, no como dependencia. |

## Brechas SACRÉ vs estos repos (qué copiar)

1. **Auth real en admin**: `MarcosCamara01/ecommerce-template` usa Better Auth + Supabase; SACRÉ tiene `/admin/login` provisorio sin verificar.
2. **Persistencia de órdenes**: todos persisten órdenes/items en DB; SACRÉ está en mock + modo demo (F1 DB+RLS pendiente).
3. **Rutas post-pago**: los starters definen `success/failure/pending`; en SACRÉ `back_urls` apuntan a rutas inexistentes (gap documentado en `docs/funciones-ecommerce.md`).
4. **SEO base**: Vercel Commerce trae sitemap/robots/metadata por producto; SACRÉ no tiene sitemap/robots verificados.

## Fuentes

- Búsqueda "sacre shop" ecommerce: https://sacrashop.com/, https://shopsacred.co/, https://sacreonline.com/cart (homónimos, sin relación técnica).
- Starters Next.js/Supabase: resultados de búsqueda web del 2026-09-15 (links en la tabla).
