# Stack y framework — SACRÉ e-shop

> Baseline verificado contra código real (2026-09-15). Solo documentación, no se tocó código.
> Parte de: [[projects/sacre-shop/docs/README]] · Relacionados: [[funciones-ecommerce]], [[projects/sacre-shop/docs/STATUS]]

## Stack

| Capa | Tecnología | Versión (package.json) |
|---|---|---|
| Framework | Next.js (App Router + Turbopack) | ^16.1.6 |
| UI | React + React DOM | ^19.2.4 |
| Estilos | Tailwind CSS v4 (`@import "tailwindcss"`, tokens vía `@theme`) + PostCSS | ^4.0.0 |
| Animación | framer-motion | ^12.35.1 |
| Iconos | lucide-react | ^0.469.0 |
| Editor (admin) | TipTap (`@tiptap/react`, `starter-kit`, `extension-placeholder`) | ^3.20.1 |
| Backend data/auth | Supabase (`@supabase/supabase-js`) | ^2.47.0 |
| Pagos | Mercado Pago Checkout Pro + webhook HMAC (sin SDK en deps, `fetch` directo a API) | — |
| Emails | Resend (llamado desde API routes, sin SDK en deps) | — |
| Lenguaje | TypeScript | ^5.7.0 |
| Lint | ESLint + `eslint-config-next` | ^9.17.0 |

## Cómo se arma (arquitectura)

- **App Router** en `app/`: rutas públicas (home, productos, checkout, contenido) + `admin/` con layout propio + 2 API routes (`api/orders/create`, `api/webhooks/mercadopago`).
- **Render:** mayormente estático (24 páginas en build, `BUILD_EXIT=0`); `/productos/[id]` es SSG con `generateStaticParams`; webhook y orders son dinámicos (`ƒ`).
- **Estado cliente:** `CartContext` (items, subtotal, envío, total) + `CartDrawer`. Catálogo actual = `lib/data.ts` (mock en memoria, 8 productos).
- **Supabase:** `lib/supabase/client.ts` — cliente anon solo si hay env; `createServerClient()` con `SUPABASE_SERVICE_ROLE_KEY` solo en server (API routes). Tipos DB-ready en `lib/supabase/types.ts` (`Product/Order/OrderItem`, `formatPrice` es-AR ARS).
- **Imágenes:** `next/image` con `remotePatterns: https: **` + formatos avif/webp; assets locales en `public/images/`.
- **Fuentes:** `Cronde` (local, `public/fonts/CRONDERegular.ttf`, variable `--font-cronde`) + `Montserrat` (Google Fonts, `--font-montserrat`).
- **Migrations:** `supabase/migrations/0001_init.sql` existe (vacía/pendiente hasta F1 según README raíz).

## Cómo se corre (setup)

1. Copiar `.env.example` → `.env.local` (Supabase URL + anon/service-role, MP access token, Resend key, site URL).
2. `npm install && npm run dev` → http://localhost:3000.
3. Sin credenciales el sitio funciona en **modo demo**: catálogo mock, órdenes sin persistir, sin cobro real.

## Convenciones del repo

- Microcopy en voseo rioplatense; commits `tipo(área): descripción` en español.
- Webhook: verificar `x-signature` HMAC primero, idempotencia por `payment_id`+estado, siempre ACK 200.
- Schema = migrations con RLS en toda tabla pública; checkout/admin vía `app/api/*`, nunca anon directo.
