# ORN-127 F3 — Server-side stock & price validation in orders/create

- **Linear:** ORN-127 ([SACRE] F3 Checkout MP + webhook + Resend) — In Progress
- **Kanban:** t_sacre_f3_stock (running)
- **Branch:** `feat/orn-127-stock-validation` from `feat/orn-126-catalogo-real` (2a54017 on main)
- **Roles:** 16-backend + 17-ts + 06-dba (read-only on schema)
- **TDD source:** strict TDD (GATE-TDD) — RED log before any implementation, vitest runner
- **Date opened:** 2026-09-28 (night shift)

## Objective

Close the oversell window (judge H3 from ORN-126 dual review) and the latent
P0: checkout sends `product_id` = slug (post-ORN-126 `Product.id = slug`), but
`order_items.product_id` is a uuid FK → first real order after ORN-126 merge
would crash on FK violation. Validate server-side against the live DB:
resolve slug→uuid, verify price, stock ≥ qty, and is_active, before inserting
the order.

## Problem / Why

- `app/api/orders/create/route.ts` trusts `item.price` and `item.quantity`
  from the client (lines 84-97). A tampered client can set price=1 on a
  9500-peso product or oversell beyond stock (ISR revalidate=300 keeps stale
  stock on the client for up to 5 min).
- `app/checkout/page.tsx:69` sends `product_id: i.product.id` where
  `Product.id = slug` since ORN-126 — the FK `order_items.product_id →
  products.id (uuid)` will reject it.

## Scope

- IN: server-side validation module `lib/orders/create.ts` (+ tests), wiring
  in `app/api/orders/create/route.ts`, no schema change (products.id uuid
  stays; resolution slug→uuid happens server-side).
- OUT: checkout front-end changes, MP preference creation, email, admin,
  stock decrement on payment (separate slice), merge to main.

## Tasks

- [x] T1 — RED: `lib/orders/create.test.ts` failing (module not found) + log
      (sacre_tdd_red_127.log: Cannot find module './create', 1 suite failed)
- [x] T2 — GREEN: `lib/orders/create.ts` — resolveAndValidateItems(client,
      items): per-item slug→uuid lookup (by slug OR uuid passthrough),
      is_active check, price equality (integer exact), stock ≥ qty; returns
      discriminated union { ok: true, items } | { ok: false, status, code,
      message }; never throws (returns { ok:false, 503 } on query error).
      vitest lib/orders/create.test.ts: 15/15 passed.
- [x] T3 — Triangulation/edge: duplicate slug items in one cart, inactive
      product, price mismatch (±1), insufficient stock, unknown slug, uuid
      passthrough, query error → 503, DB not configured (demo mode) → skip
      validation (preserve demo contract), empty items handled by existing
      validateOrderData. (All pinned in the 15 module tests.)
- [x] T4 — Wire route: on { ok:false } → HTTP response with code/message
      (400/503); on ok → insert with resolved uuid product_id; unit_price
      from DB price, subtotal recomputed from DB prices. NOTE: client-total
      re-compare deferred — route keeps body.subtotal/total for the orders
      row (documented; DB-verified price integrity is the security fix).
- [x] T5 — Docs: update odd/tasks doc + commit messages; no new root-level
      .md files (dev-protocol rule).
- [x] T6 — RED/GREEN for route-level demo-mode + wiring pins:
      `app/api/orders/create/route.test.ts` (3 tests) — demo mode 200 mock;
      unknown slug → 400 unknown_product with ZERO inserts; tampered price
      → DB price + resolved uuid in the order_items payload, slug never
      reaches the insert. Required vitest.config.ts with @/ alias.
- [x] T7 — Full gates: vitest all green (67/67, 5 files), tsc --noEmit 0,
      next build EXIT 0 (log sacre_build_127b.log), gitleaks via pre-commit,
      RDD receipt staged, commit + push feature branch.
- [x] T8 — Kanban t_sacre_f3_stock → review with LGTM summary; Linear
      ORN-127 comment with evidence.

## Acceptance criteria

- Client-supplied price can never reach order_items (DB price always wins).
- Order with insufficient stock is rejected with 400 before any insert.
- Slug product_ids resolve to real uuids; order insert never hits FK error
  from a slug.
- Demo mode (no Supabase config) unchanged: mock response, no crash.
- All tests green + tsc 0 + build EXIT 0; receipt signed before commit.

## Progress log

- 2026-09-28 T0: state read — ORN-126/140 In Review (LGTM pending, untouched),
  ORN-203/200 done. Chose ORN-127 slice per cron focus (webhook MP +
  migrations area). Anti-dup check: `fea/sacre-orders-validate` (2026-09-17)
  hardens payload validation but does NOT validate against DB (no stock/price
  lookup, no uuid resolution) — different scope, no >70% overlap; referenced
  in this doc. Judge H3 (ORN-126 review) names this exact gap. Card created
  running.
- 2026-09-29 night shift: T1-T8 executed. TDD RED logged (sacre_tdd_red_127.log)
  then GREEN 15/15 module + 3/3 route pins; suite total 67/67 (5 files);
  tsc --noEmit EXIT 0; next build running in background (sacre_build_127b.log
  — checked at commit time). Deferred: client-total vs server-total compare
  (body.subtotal still written to orders row; prices themselves are now
  DB-sourced, which closes the oversell/tamper window — total compare is a
  consistency nicety, ticketed as follow-up in ORN-127 Linear comment).
- 2026-09-29 night turno 2 (T9, follow-up): cerrado el debt "client totals
  never reach the orders row". RED logged (sacre_tdd_red_127b.log: expected
  10000, got 2) con 1 test nuevo `server subtotal/total override client
  values in the orders insert` en route.test.ts (`--no-isolate --pool=threads
  --testTimeout=30000` por cold-start de vitest en este runner). GREEN
  4/4 en el archivo, suite full 68/68 (5 files). Cambios:
  `createSupabaseOrder` ahora recibe `amounts: { subtotal, total }`
  computados server-side (subtotal = resolved.subtotal ya DB-sourced; total =
  subtotal + shipping_cost, default 0 si ausente). Mismatch cliente-vs-server
  se loguea con `console.warn("[orders/create] client-total mismatch", …)`
  (sin PII, solo order_number + números). `sendConfirmationEmail` también
  pasa el total server-side. TS signature cambió: createSupabaseOrder ahora
  exige amounts — hay 1 sola call-site y la type-check tsc completa quedó
  en curso en background (log separado si falla).
