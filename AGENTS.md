# AGENTS — sacre-shop

Next.js 16 + React 19 + Tailwind 4 · Supabase · Mercado Pago · Resend.
Microcopy en voseo rioplatense.

## Rules

### TypeScript
- `const`/`let`, never `var`; prefer interfaces; avoid `any` in new code.
- Validate webhook/API payloads before trusting them.

### Payments (Mercado Pago)
- Every webhook call MUST pass HMAC `x-signature` check first (see `app/api/webhooks/mercadopago/route.ts`).
- Handlers MUST be idempotent (`payment_id` + `payment_status`); always ACK 200, process async.
- Never process card data directly; never log secrets or tokens.

### Supabase
- `SUPABASE_SERVICE_ROLE_KEY` is server-only (`createServerClient`); checkout/admin go through `app/api/*`, never anon direct.
- Schema changes are migrations in `supabase/migrations/`; RLS on every public table.

### Commits
- Español rioplatense, formato `tipo(área): descripción`; nunca commitear `.env.local` ni secretos.

## Docs del proyecto — rutas canónicas (set infaltables v2)

> Convención de flota: `E:/Hermes/docs/sistema/docs-infaltables-proyectos.md` — raíz = lo que las herramientas consumen; `docs/` = biblioteca con nombre fijo.

- **Raíz:** `README.md` · `AGENTS.md` · `SECURITY.md` · `CONTRIBUTING.md` · `CHANGELOG.md` · `ARCHITECTURE.md` · `LICENSE`
- **`docs/`:** `docs/DESIGN.md` · `docs/API.md` · `docs/DATABASE.md` · `docs/marca.md` · `docs/plan-accion-YYYY-MM-DD.md` · `docs/runbooks/`

Pendientes en este proyecto (audit 19-writer 2026-10-19): `LICENSE` (ORN-219) · `docs/DESIGN.md` · `docs/marca.md` (≈ `docs/branding-identidad-visual.md`) · `docs/plan-accion-*.md` (ORN-218) · `docs/runbooks/` (ORN-217) · superficie de API a definir (ORN-223)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
