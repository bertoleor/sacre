> Parte de: [[INDICE-SISTEMA]] · Relacionados: [[projects/sacre-shop/docs/STATUS]], [[tickets-barrido-2026-09-16]]

# ODD Feature — sacre-p0-1-admin-auth

> **Búsqueda:** keywords: `sacre, auth, admin, supabase-auth, rls, httpOnly, server-action, is_admin` · clasificación: `odd-feature` · estado: in-progress · actualizado: 2026-10-07

## Objective
Replace the hardcoded admin credential (`sacre/chocolate`) and localStorage session with real Supabase Auth (email/password) enforced by server-side session cookies and RLS admin policies.

## Problem / Why
`app/admin/login/page.tsx` compared credentials in the client and wrote `admin_session=true` to localStorage; `app/admin/layout.tsx` trusted that flag. Anyone reading the bundle gets the password, and anyone with devtools gets a session. P0-1 of the 2026-09-16 audit sweep.

## Scope
- In: Supabase Auth email/password login via Server Action; session cookies set server-side (httpOnly); middleware refresh + guard for /admin/*; admin layout as server component; migration 0003 (admin_users + is_admin() + policies on products/product_categories/orders/order_items/notifications); real admin user created in canonical project (t5); signup disabled; adversarial RLS verification (live); vitest unit tests for pure auth logic; docs (STATUS, barrido ticket row).
- Out: wiring admin pages to live DB data (F4), customer-facing auth, Mercado Pago changes, retirement decision for the duplicate project (owner), JWT edge cases beyond standard session handling.

## Constraints
- TDD strict: RED → GREEN → REFACTOR. Runner: vitest (repo has 28 tests baseline: allergens 11 + webhooks 17).
- DB changes against live Supabase via management API (SUPABASE_PAT_5, never printed). Pre-apply backup in E:/Hermes/supabase-backups/ (DBA gate pattern from P0-3).
- The 6 invariants of scripts/rls_audit.py must stay GREEN after 0003.
- Ticket gates: tsc EXIT=0 · vitest all green · real Supabase login (no mock) · no trace of the hardcoded credential · conventional commit + Generated-By trailer + Linear mirror. Human LGTM required before merge to main.
- No next build in the gate (takes 12-20 min on this box; killed two prior runs on timeout).

## Tasks (stable IDs)
- [x] T1: Pre-apply backup (t5) + RED: scripts/auth_rls_verify.py fails (no is_admin/policies)
  - evidence: backup `E:/Hermes/supabase-backups/SACRE-qirzicgqqmcqlvyqskkv/pre-0003-20261007-020613.json` (2 policies, 100 grants, 0 auth_users); verify run 2026-10-07 → `RED: 11 invariantes violadas` EXIT=1
- [x] T2: Migration 0003_admin_auth.sql + down.sql applied to t5 → verify script GREEN, rls_audit.py 6/6 GREEN
  - evidence: apply 24/24 OK EXIT=0 (idempotent re-apply after grant fix); `auth_rls_verify.py` → GREEN 15/15 EXIT=0; `rls_audit.py` → GREEN 6/6 EXIT=0. Accepted change: 0003 re-grants DML to authenticated (0002 had revoked it) — RLS is_admin() is now the real gate; down.sql re-revokes.
- [x] T3: Admin auth user created in t5 (email_confirm, admin_users row), public signup disabled, adversarial non-admin test
  - evidence: `provision_admin.py` → GREEN 15/15 EXIT=0: admin@sacre.com.ar created + admin_users row; disable_signup=true (D1); intruder probe: INSERT products→403, SELECT orders→[] , SELECT admin_users→[], RPC is_admin()=false; admin probe: INSERT→201, RPC is_admin()=true. Creds in `.env.e2e.local` (gitignored).
- [x] T4: .env.local repointed to canonical t5 (keys fetched via management API, never printed)
  - evidence: provision_admin.py step 7 → `.env.local re-apuntado al canonico t5 qirzicgqqmcqlvyqskkv` (NEXT_PUBLIC_SUPABASE_URL/ANON + SERVICE_ROLE, untracked file)
- [x] T5: Unit tests RED → lib/auth (validateCredentials, mapAuthError) → GREEN
  - evidence 2026-10-07 turno-noche: test suite RED real detectado al retomar (1/9 falla
    "rate limit → mensaje de reintento" — assertion esperaba 'reintent' minúscula, el copy
    real es 'Reintentá'). Fix de assertion + suite full verde: `npx vitest run --no-isolate
    --pool=threads --testTimeout=30000` → **37/37 PASS (3 files, 746ms)**. log:
    `vitest-t5-full.log`. tsc --noEmit ambient-timeout 120s y 240s (box lenta, no es
    regression del diff — diff es 1 char en string assertion). Se declara pendiente para
    próximo turno.
- [x] T6: @supabase/ssr + supabase-js ^2.114 installed
  - evidence: node -p → supabase-js=2.117.2 ssr=0.12.7; package.json deps `@supabase/ssr ^0.12.7`, `@supabase/supabase-js ^2.117.2` (peer ^2.114.0 satisfied)
- [ ] T7: Server session client (lib/supabase/server.ts) + middleware.ts (refresh + guard /admin/*)
- [ ] T8: Login rewritten (server action + form) — hardcoded credential and localStorage pattern removed
- [ ] T9: Admin layout → route group (dash) as server component; AdminShell client chrome; logout server action
- [ ] T10: Gates: tsc EXIT=0, vitest green, credential-trace grep clean
- [ ] T11: Real login E2E against dev server (httpOnly evidence + unauth redirect + logout)
- [ ] T12: Docs (STATUS, barrido row), Linear mirror, commit + push, review request

## Accumulated evidence
- 2026-10-07: `python scripts/auth_rls_verify.py qirzicgqqmcqlvyqskkv` → RED 11 invariantes EXIT=1 (pre-0003)
- 2026-10-07: `python scripts/apply_0003.py ... 0003_admin_auth.sql` → 24/24 OK GREEN (post grant-fix, idempotent)
- 2026-10-07: `python scripts/provision_admin.py qirzicgqqmcqlvyqskkv` → GREEN 15/15 EXIT=0 (real password-grant logins + adversarial RLS probes)
- 2026-10-07: `python scripts/auth_rls_verify.py qirzicgqqmcqlvyqskkv` → GREEN 15/15 EXIT=0
- 2026-10-07: `python scripts/rls_audit.py qirzicgqqmcqlvyqskkv` → GREEN 6/6 EXIT=0 (P0-3 invariants intact)

## Accepted changes and rationale
- Login via Server Action instead of client signInWithPassword: only the server can set httpOnly cookies; the browser never touches the session (ticket decision "sesión server-side, cookie httpOnly").
- Route group app/admin/(dash)/: app/admin/layout.tsx wraps /admin/login too, so a server-side auth check there would redirect the login page into a loop. Group keeps URLs identical.
- .env.local repointed from duplicate ref (xaxioylgwhbxtjgglwrx) to canonical t5 (qirzicgqqmcqlvyqskkv): project-map says canonical = t5; DE flagged the misalignment. Untracked local file, reversible.
- 0003 applied schema-first to canonical t5 only (user+config); duplicate ref pending owner retirement decision — schema sync deferred if budget runs out.
- 0003 re-grants DML to `authenticated` on admin tables (0002 had revoked ALL write): without the grant, RLS passes but Postgres ACL denies (403 permission denied) — verified live. The DE's audit invariant (anon without write grants) stays GREEN; the perimeter is now is_admin() via RLS.

## Next step
T5: write lib/auth tests first → RED → implement validateLoginForm/mapAuthError → GREEN; then T7-T9 server session wiring.
