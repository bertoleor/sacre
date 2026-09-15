# Proposal: `formatAllergenLabel` (apply de ficha-alergenos)

> Change de apply. Cita el spec base `openspec/changes/sacre-ficha-alergenos/specs/ficha-alergenos/spec.md`.
> Esa carpeta es docs-only y queda intacta: este change agrega el helper puro + tests.

## Intent

Darle a la ficha `/productos/[id]` un formateador único de alérgenos por producto,
con fallback obligatorio cuando no hay datos (el spec base prohíbe omitir el aviso
en silencio).

## Scope

### In Scope

- `lib/allergens.ts` — `formatAllergenLabel(allergens)` puro, sin JSX ni I/O
- `lib/allergens.test.ts` — tests `node:test`, cadena RED → GREEN real
- Este pack SDD (`proposal.md`, `specs/formato-alergeno/spec.md`, `design.md`,
  `tasks.md`, `verify.md`)

### Out of Scope

- Render en `app/productos/[id]` (próximo change, cita este spec)
- Cambios de checkout/cart (prohibido por el spec base)
- Tocar `openspec.config.yaml` (untracked pre-existente, no se toca)

## Approach

Strict TDD: test failing primero (RED con evidencia), implementación mínima
después (GREEN), verificación real (`tsc --noEmit` + `node --test`), `verify.md`
con salidas, tasks tildadas, commit acotado sin push.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `lib/allergens.ts` | New | Helper puro |
| `lib/allergens.test.ts` | New | Tests node:test |
| `openspec/changes/sacre-ficha-alergenos-apply/` | New | Este pack SDD |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Nombres de alérgenos en inglés desde datos | Med | Mapa canónico en→es en el helper |
| Duplicados / espacios en datos | Med | Normalización + dedupe en el helper |

## Rollback Plan

Borrar `lib/allergens.ts` + `lib/allergens.test.ts`; nada los importa todavía,
así que el rollback no rompe nada.

## Dependencies

- Spec base: `openspec/changes/sacre-ficha-alergenos/specs/ficha-alergenos/spec.md`
  (Requirement Missing-Data Fallback → este helper lo implementa a nivel texto)

## Success Criteria

- [x] `node --test lib/allergens.test.ts` EXIT=0
- [x] `npx tsc --noEmit` EXIT=0
- [x] `verify.md` con salidas reales
- [x] Commit acotado a archivos propios, sin push
