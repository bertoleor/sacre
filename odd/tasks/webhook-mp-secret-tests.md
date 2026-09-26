# odd/tasks — Webhook MP: secret en .env.example + tests HMAC/TDD + runner test

> Feature: `webhook-mp-secret-tests` · Creada 2026-09-26 (turno noche G0 SACRE)
> Tarjeta: Linear ORN-203 (In Progress) · Kanban sacre t_f339badf (running)
> Proyecto: Hermes Sync & Fixes - Sep 2026

## Objetivo
Cerrar los gaps verificados del foco webhook MP + migraciones sin bloqueos:
1. `.env.example` sin `MERCADOPAGO_WEBHOOK_SECRET` (sin él todo webhook 401 + flood MP ~24h).
2. Cero tests del webhook MP (HMAC, timing-safe, status-mapping).
3. Sin script `test` en `package.json` (P1-1 del barrido 2026-09-16).

## Alcance autorizado
Solo lectura-código + ediciones del foco. Product-logic sin cambios: la lógica
extraída es byte-equivalente en comportamiento (misma firma, mismos mapas).
P0-1 (Auth admin hardcodeado) y P0-3 (proyecto Supabase) requieren humano — escalan al digest.

## Checklist
- [x] T1: Extraer `verifyXSignature`/`getPaymentStatus`/`getOrderStatus` a `lib/webhooks/mercadopago.ts` (lógica pura, secret inyectable para tests)
- [x] T2: Tests `lib/webhooks/mercadopago.test.ts` — 21 casos: HMAC válido/inválido, timing-safe, secret ausente/distinto, inyección de manifest, mapeo de estados
- [x] T3: GREEN — `npm test` 28/28 (21 webhook + 7 allergens), 2 archivos, tsc 0 errores
- [x] T4: `route.ts` consume la lógica extraída (sin duplicación; verificado juez dual: body-equivalente, única delta = secret inyectable)
- [x] T5: `.env.example` + `MERCADOPAGO_WEBHOOK_SECRET` documentado con advertencia de flood
- [x] T6: `package.json` + script `test: vitest run` + devDep vitest@5.0.2
- [ ] T7: Commit + push (RDD receipt previo) + tarjeta → review

## Ruta de implementación por tarea
- T1-T6: direct inline (writer único, archivos ya entendidos; triggers de delegación no aplican — 1 archivo no-trivial por unidad coherente)
- T7: inline (git + rdd-receipt)

## Verificación (comandos)
- `npm test` — 28/28 verde (log: `vitest-final.log`) ✓ 2026-09-26 14:17
- `npx tsc --noEmit` — 0 errores ✓ 2026-09-26 14:17

## Progreso y evidencia
- T1/T2 escritos 2026-09-26 (commit pendiente con T3-T7).
- npm install: 2 timeouts + 1 ENOTEMPTY (colisión installs concurrentes) → reintento único secuencial OK (exit 0).
- 2026-09-26: T4 route refactorizado, T5 .env.example, T6 package.json — commit único al cerrar.
- T3 GREEN 2026-09-26 14:17: npm install exit 0 ( secuencial), vitest 5.0.2 faltaba como devDep → `npm i -D vitest` → 28/28 GREEN, tsc 0 err.
- GATE-SEC-SEMANAL (rol 13): gitleaks git --log-opts=--all → 22 commits, 0 leaks. Trivy HIGH,CRITICAL → 22 hallazgos (next 16.1.6: 2 CRITICAL + 12 HIGH; sharp 2; postcss 2; ws 1; tiptap/linkify-it 3) — deuda preexistente ORN-200, no bloquea este cambio.
- Falso positivo descartado: lectores de output redactan el patrón `Authorization: Bearer` de stdout; el código real tiene 2 Bearer y 0 `***` (verificado con grep -c: números no redactables).

## Próximo paso
T7 commit+push con RDD receipt → Linear ORN-203 + kanban t_f339badf → review con resumen LGTM.

## Notas
- Los 2 CRITICAL de `next` (CVE-2026-75604, GHSA-2xp9-vwfh-vxw4) tienen fix en 16.3.3 — pertenecen a ORN-200 (upgrade deps), no al scope webhook.
