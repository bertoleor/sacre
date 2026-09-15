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
