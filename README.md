# sacre-shop — e-shop chocolatería SACRÉ

Next.js 16 + React 19 + Tailwind 4 · Supabase · Mercado Pago · Resend. Voseo en todo el microcopy.

## Setup

1. Copiá `.env.example` a `.env.local` y completá credenciales (Supabase URL + anon/service-role, MP access token, Resend API key, site URL).
2. `npm install && npm run dev` (http://localhost:3000).

## Estructura

- `app/` — tienda (home, productos, checkout, contacto, faq, quienes-somos, términos) + `admin/` (login, pedidos, productos) + `api/orders/create` + `api/webhooks/mercadopago`.
- `lib/data.ts` — catálogo MOCK (a reemplazar por DB en F2). `lib/supabase/` — cliente + tipos (`Order`, `OrderItem`, `Product`).
- `supabase/migrations/` — vacía hasta F1 (ver spec). DDL mínimo propuesto en el spec.

## Documentación

Índice consolidado de docs en [`docs/`](docs/README.md) — incluye el [reporte de producto, marketing y estilo](docs/reporte-producto-marketing-estilo-2026-09-14.md).

## Spec y fases

Canónico: `E:/Hermes/docs/plans/sacre-spec.md` — F1 DB+RLS → F2 catálogo real → F3 checkout MP+webhook → F4 admin pedidos → F5 pulido. Tickets Linear `[SACRE] F1..F5` (team Ornella).
