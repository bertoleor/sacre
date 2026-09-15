# SACRÉ — Estado técnico

> Verificado 2026-09-15 contra `E:/Hermes/docs/plans/sacre-spec.md` y `sacre_build.log`.

- **Build**: PASS — `next build` EXIT=0 (Next.js 16.1.6 Turbopack, TS ok, 24 rutas estáticas/SSG).
- **Tests**: NINGUNO — sin runner (solo `build`/`lint`/`dev`/`start` en scripts; `strict_tdd: false` en `openspec.config.yaml`); `lint` no ejecutado.
- **DB / Supabase**: migración `supabase/migrations/0001_init.sql` + `seed.sql` presentes (0 tablas → DDL listo), pero **sin proyecto Supabase SACRE** en la org → F1 pendiente. Productos siguen hardcodeados en `lib/data.ts` (no hay stock/DB).
- **Webhook MP**: ruta `app/api/webhooks/mercadopago` con validación x-Signature + idempotencia (commit `d41b283`).
- **Cumple spec**: stack (Next 16/React 19/Tailwind 4 + Supabase+MP+Resend), frontend funcional, modelo `Product/Order/OrderItem` diseñado en types.
- **Falta spec**: F1 DB+RLS (proyecto Puppeteer Supabase), F2 catálogo real (quitar mock), integración end-to-end MP con pago de prueba. Próximo blocker: definir dónde vive la DB.