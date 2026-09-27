# ORN-140 — Webhook MP: end-to-end hardening (firma + idempotencia + DB viva)

> Feature: ORN-140 [SACRE][ROJO] Webhook MP sin firma + 500 + DB vacía — turno noche G0 2026-09-27
> Route: direct inline (fix ≤3 archivos, mecánico, ya entendido) + commit work-unit
> TDD: STRICT (runner vitest 5.0.2, `npx vitest run`, fuente .env TDD_MODE=on + protocolo)
> Baseline verificado 2026-09-27 11:00 ART: vitest 28/28 PASS, DB SACRE ACTIVE_HEALTHY,
> 5 tablas + RLS ON + seed (8 productos, 3 categorías) — migración 0001_init.sql APLICADA y verificada en vivo.

## Objetivo
Cerrar ORN-140 con evidencia de que sus tres sub-ítems ya resueltos en main siguen vigentes
(firma HMAC x-signature en ruta, migración aplicada en DB viva) y endurecer el handler del
webhook: cubrir con tests el flujo POST completo (401 sin firma, ACK non-payment, fallback
request_id del body, idempotencia) que hoy no tiene cobertura.

## Problema
El route handler `app/api/webhooks/mercadopago/route.ts` (182 líneas) no tiene tests: la
lógica pura tiene 21 tests pero el handler (parse, 401, ACK, fetch a MP, idempotencia,
insert notifications, email) está sin testear. Riesgo de regresión alta en zona de pagos.

## Por qué
1. La tarjeta pide "webhook MP con firma" — la firma está (commit 2625383) pero sin
   tests del handler la garantía es solo de lectura de código, no verificable.
2. GATE-TDD: sin log de test no hay done. El handler ES el código que procesa dinero.

## Scope autorizado
- `app/api/webhooks/mercadopago/route.ts` — refactor mínimo para ser testeable (inyectar
  fetch/supabase/email), CERO cambio de comportamiento observable externo.
- `app/api/webhooks/mercadopago/route.test.ts` — NUEVO, tests del POST handler.
- `docs/workflows/` o `docs/` en sacre-shop: doc breve del webhook (estado real).
- Kanban t_2c86ab2d (todo→running→review) + Linear ORN-140 mirror.

## Tasks (checklist con IDs estables)
- [ ] T1: Test ROJO — POST sin x-signature → 401 (ejecutado, falla porque handler no exportable testeable aún)
- [ ] T2: Test ROJO — POST type!=payment → ACK {success:true} sin tocar DB/MP
- [ ] T3: Test ROJO — POST válido → fetch MP + update idempotente + insert notification
- [ ] T4: Refactor handler: DI de fetch/`createServerClient`/email para tests; verde mínimo
- [ ] T5: Triangulación edge cases: firma inválida→401, MP fetch falla→ACK sin update,
      payment duplicado (idempotencia)→no re-notificar, request_id fallback desde body
- [ ] T6: typecheck + vitest run completa verde + next build EXIT 0
- [ ] T7: Work-unit commit (feat/fix semántico + trailer Generated-By) en feat/orn-140-webhook-e2e
- [ ] T8: RDD receipt antes de push (scripts/rdd-receipt.py) + push origin
- [ ] T9: Kanban: complete → review con resumen LGTM; Linear ORN-140 → In Review; espejo
- [ ] T10: Reporte envelope final + log de corrida en reports/cron-runs/

## Verificación (evidencia)
- `npx vitest run` — ROJO primero (log), luego verde 28+ N/28+N
- `npx tsc --noEmit` — EXIT 0
- `npx next build` — EXIT 0
- Kanban + Linear estado espejo verificado con `hermes kanban show` + Linear list

## Aceptación
- Handler testeado end-to-end sin mocks frágiles ni cambio de contrato HTTP.
- 0 P0/P1 abiertos en la zona webhook. Sin tarjeta actualizada el trabajo no cuenta.
