# Design: `formatAllergenLabel`

## Firma

```ts
formatAllergenLabel(allergens: readonly string[] | null | undefined): string
```

Función pura en `lib/allergens.ts`. Sin JSX, sin I/O, sin dependencias.
`readonly` acepta los arrays de producto sin fricción; `null`/`undefined`
cubren el producto sin datos.

## Algoritmo

1. Si `allergens` es `null`/`undefined` → fallback.
2. Normalizar: `trim` cada item, descartar vacíos.
3. Si no queda nada → fallback.
4. Dedupe case-insensitive por clave `toLowerCase()`, conservando la primera
   aparición (orden estable, determinístico).
5. Mapear cada clave al mapa canónico es→es / en→es; si no está, capitalizar
   (`Maní` de `maní`, respeta el resto tal cual).
6. Devolver `"Contiene: " + labels.join(", ") + "."`.

## Mapa canónico

| Clave (lower) | Etiqueta |
|---|---|
| `leche`, `milk` | Leche |
| `avellana(s)`, `hazelnut(s)` | Avellana |
| `nuez`, `nueces`, `nuts`, `walnut` | Frutos secos |
| `gluten` | Gluten |
| `soja`, `soy` | Soja |
| `huevo(s)`, `egg(s)` | Huevo |

## Constantes

- `ALLERGEN_FALLBACK = "Consultá antes de comprar: información de alérgenos no disponible."`
  Exportada para que el futuro render la reuse sin duplicar el literal.

## Tests

`lib/allergens.test.ts` con `node:test` + `node:assert/strict` (sin runner nuevo:
Node 24 ejecuta TS con type-stripping). 9 casos cubriendo los 7 escenarios del spec.

## No-goals

- Sin JSX/componentes (eso va en el change de render).
- Sin tocar `lib/data.ts` (los datos con alérgenos llegan después).
- Sin checkout/cart.
