# SACRÉ — Estado técnico

> **Búsqueda:** keywords: `sacre, supabase, rls, f1, migraciones, backup, grants, anon` · clasificación: `estado-tecnico` · estado: canónico · actualizado: 2026-10-06
> Verificado 2026-10-06 contra la DB viva (management API) por P0-3 F1. Histórico 2026-09-15: spec `sacre-spec.md`, `sacre_build.log`.
> Parte de: [[projects/sacre-shop/docs/README]] · Relacionados: [[stack-framework]], [[tickets-barrido-2026-09-16]]

- **Build**: PASS — `next build` EXIT=0 (Next.js 16.3.6, TS ok; re-verificar por rama).
- **Tests**: vitest 5.0.2 (script `test`, `vitest.config.ts` — `lib/**` + `app/**` *.test.ts). Suite viva: ver rama de trabajo.
- **DB / Supabase (F1 — 2026-10-06)**: PROYECTO VIVO y VERIFICADO — `SACRE` ref `qirzicgqqmcqlvyqskkv` (t5, us-west-2, Postgres 17.6, ACTIVE_HEALTHY, creado 2026-09-14). Migración `0001_init.sql` + `seed.sql` APLICADAS: 5 tablas (products, product_categories, orders, order_items, notifications), 8 products + 3 categories, 0 orders. Catálogo sale de la DB vía `lib/catalog.ts` (service role), mock `lib/data.ts` solo queda como fuente admin pendiente de F4.
- **RLS (F1)**: ON en las 5 tablas. `0002_rls_harden.sql` (P0-3) cerró los grants heredados de Supabase: anon sin INSERT/UPDATE/DELETE/TRUNCATE (solo SELECT sujeto a RLS); policies genéricas `authenticated` cmd=ALL removidas — cualquier signup ya NO puede leer/escribir órdenes ni el catálogo. Escrituras: solo service_role (checkout/admin server-side) hasta que P0-1 monte las policies admin reales sobre Supabase Auth. Down: `0002_rls_harden_down.sql` + retro-fit `0001_init_down.sql` (gate DBA).
- **Audit reproducible**: `scripts/rls_audit.py [ref]` — 6 invariantes (RLS on, sin PUBLIC, sin write-anon, qual restrictivo products, grants cerrados). GREEN 6/6 en `qirzicgqqmcqlvyqskkv` y en el duplicado `xaxioylgwhbxtjgglwrx` (org t1, ver abajo).
- **Proyecto duplicado**: `sacre` minúscula ref `xaxioylgwhbxtjgglwrx` (org t1, sa-east-1, creado 2026-09-27) — mismo schema, mismo hardening aplicado 2026-10-06. `.env.local` histórico apunta acá; project-map canónico dice SACRE = t5 `qirzicgqqmcqlvyqskkv`. **Decisión pendiente owner** (merge/retiro del dup) — no bloquea F1.
- **Backups (gate DBA)**: `E:/Hermes/supabase-backups/SACRE-qirzicgqqmcqlvyqskkv/pre-0002-*.json` (schema+policies+grants+filas products/categories) y `SACRE-xaxioylgwhbxtjgglwrx/pre-0002-*.json`, ambos verificados antes de aplicar 0002.
- **Webhook MP**: ruta `app/api/webhooks/mercadopago` con validación x-Signature + idempotencia (commit `d41b283`).
- **Cumple spec**: stack (Next 16/React 19/Tailwind 4 + Supabase+MP+Resend), frontend funcional, modelo `Product/Order/OrderItem` en types, catálogo real desde DB.
- **Falta spec**: F4 admin sobre DB real (el admin aún usa mock `lib/data.ts`), P0-1 auth admin (Supabase Auth — montará policies RLS admin sobre este esquema), decisión owner sobre proyecto dup, integración end-to-end MP con pago de prueba.