> Parte de: [[INDICE-SISTEMA]] · Relacionados: [[INDICE-DOCS]], [[ADR-TEMPLATE]]

# SACRÉ SHOP — tienda de chocolates artesanales con checkout y panel admin

> Path: `E:/Hermes/projects/sacre-shop` · Stack: Next.js 16.3.6 + React 19 + Tailwind 4 · Supabase · Mercado Pago · Resend · vitest · Estado: ACTIVO
> Registry: `E:/Hermes/projects.json#sacre` (branch registrado `fea/sacre-orders-validate` — ⚠️ deriva de la rama real) · Mapa: `E:/Hermes/docs/plans/project-map.md`
> Última verificación: 2026-09-27 (F0 — ver `docs/F0-2026-09-27.md`)

## 1. Qué es
- E-shop de chocolatería artesanal SACRÉ: catálogo, carrito, checkout con Mercado Pago y webhook firmado (HMAC).
- Panel `/admin` con dashboard, productos y pedidos — **⚠️ auth casera (P0 abierto)**: credenciales hardcodeadas en cliente + sesión en `localStorage`, sin Supabase Auth. Ver `docs/tickets-barrido-2026-09-16.md` P0-1.
- Catálogo hardcodeado en `lib/data.ts` (mock); la migración `supabase/migrations/0001_init.sql` ya tiene el DDL real (5 tablas + RLS con 8 policies) pero **no hay proyecto Supabase creado** — F1 pendiente.
- Microcopy en voseo (identidad de marca: `docs/branding-identidad-visual.md`).

## 2. Cómo correr
- Requisitos: Node 24, npm; credenciales en `.env.local` desde `.env.example` (solo nombres, sin valores reales).
- `npm install`
- `npm run dev` — http://localhost:3000
- `npm test` — vitest run (37 tests; ver estado en §5)
- `npx tsc --noEmit` — typecheck estricto
- `npm run build` — ⚠️ en este host falla con `TurbopackInternalError` (spawn de subproceso `0xc0000142`, causa ambiental; ver `docs/F0-2026-09-27.md` §3)

## 3. Estructura de carpetas (solo primer nivel)
- `app/` — tienda (home, productos, checkout, contacto, faq, quienes-somos, términos) + `admin/` (login, pedidos, productos) + `api/orders/create` + `api/webhooks/mercadopago`
- `components/` — UI (Navbar, Hero, ProductGrid, CartDrawer, etc.)
- `lib/` — `data.ts` (catálogo mock), `supabase/` (cliente + tipos), `webhooks/` (lógica MP + tests), `allergens.ts`, `context/CartContext`
- `supabase/` — `migrations/0001_init.sql` (DDL + RLS, sin aplicar) + `seed.sql`
- `docs/` — índice en `docs/README.md`
- `openspec/` — cambios SDD (webhook-verify, ficha-alergenos)

## 4. Documentación canónica
- Producto (PRD): `docs/plans/PRD-sacre-shop-minimo.md`
- Plan activo: `docs/STATUS.md` + `docs/tickets-barrido-2026-09-16.md` (P0/P1 abiertos)
- ADRs: `N/A`
- Espejo en Hermes: `E:/Hermes/docs/proyectos/sacre.md`

## 5. Estado actual
- Rama: `feat/orn-140-webhook-e2e` · CI: N/A (no existe `.github/`)
- Typecheck: PASS (`tsc --noEmit` exit 0) · Tests: 36/37 pasan (1 timeout de hook en este host) · Build: FAIL en este runner (ambiental, sin verificar PASS)
- Próximo hito: F3 salud — re-verificar build en entorno no restringido; luego P0 auth admin → Supabase Auth + RLS (SACRE-P0-1, requiere LGTM)
- Tickets abiertos: SACRE-P0-1 (auth admin), P0-3 (proyecto Supabase), P1-2 (script `lint` roto: `next lint` eliminado en Next 16), P1-4 (hardening `orders/create`), P1-6 (historial sucio)
