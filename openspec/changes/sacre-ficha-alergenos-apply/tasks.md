# Tasks: `formatAllergenLabel` (apply)

Cita base: `openspec/changes/sacre-ficha-alergenos/specs/ficha-alergenos/spec.md`.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~120 prod+test, ~200 docs SDD |
| 400-line budget risk | None |
| Chained PRs recommended | No |
| Delivery strategy | single-pr |

## Phase 1: Spec (este change)

- [x] 1.1 `proposal.md` con intent, scope, rollback
- [x] 1.2 `specs/formato-alergeno/spec.md` con requirements + escenarios
- [x] 1.3 `design.md` con firma, algoritmo y mapa canónico
- [x] 1.4 `tasks.md` (este archivo)

## Phase 2: Strict TDD

- [x] 2.1 RED: `lib/allergens.test.ts` creado primero, corre en rojo (evidencia en `verify.md`)
- [x] 2.2 GREEN: `lib/allergens.ts` implementado, `node --test` en verde

## Phase 3: Verify + Delivery

- [x] 3.1 `npx tsc --noEmit` EXIT=0
- [x] 3.2 `verify.md` con salidas reales (RED, GREEN, tsc)
- [x] 3.3 Commit acotado a archivos propios, sin push, sin tocar `openspec.config.yaml`
