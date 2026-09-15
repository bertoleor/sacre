# Formato de etiqueta de alérgenos (`formatAllergenLabel`)

Cita: `openspec/changes/sacre-ficha-alergenos/specs/ficha-alergenos/spec.md`
(Requirement Missing-Data Fallback). Este delta spec baja ese requirement a
función pura testeable; el render en `/productos/[id]` queda para el próximo change.

## Purpose

Unificar en un solo helper el texto del aviso de alérgenos por producto:
contenido exacto por producto, fallback visible sin datos, sin tocar checkout.

## Requirements

### Requirement: Etiqueta por producto

La función MUST devolver una etiqueta con exactamente los alérgenos del producto
recibido, normalizados (trim, sin vacíos, sin duplicados case-insensitive,
orden de primera aparición) y con nombres canónicos en español.

#### Scenario: Un alérgeno

- GIVEN `["leche"]`
- WHEN se llama `formatAllergenLabel`
- THEN devuelve `"Contiene: Leche."`

#### Scenario: Varios alérgenos

- GIVEN `["leche", "avellana", "gluten"]`
- WHEN se llama `formatAllergenLabel`
- THEN devuelve `"Contiene: Leche, Avellana, Gluten."`

#### Scenario: Contenido por producto, no genérico

- GIVEN dos productos con listas distintas
- WHEN se formatea cada uno
- THEN las etiquetas difieren (nada de copy-paste genérico)

### Requirement: Normalización de datos

La función MUST mapear alias en inglés a español rioplatense canónico,
tolerar espacios y capitalizar valores desconocidos.

#### Scenario: Alias en inglés

- GIVEN `["milk", "hazelnut", "soy"]`
- WHEN se llama `formatAllergenLabel`
- THEN devuelve `"Contiene: Leche, Avellana, Soja."`

#### Scenario: Sucios y duplicados

- GIVEN `[" Leche ", "leche", "SOJA"]`
- WHEN se llama `formatAllergenLabel`
- THEN devuelve `"Contiene: Leche, Soja."`

#### Scenario: Valor desconocido

- GIVEN `["maní"]`
- WHEN se llama `formatAllergenLabel`
- THEN devuelve `"Contiene: Maní."`

### Requirement: Fallback sin datos

La función MUST devolver el fallback visible cuando no hay datos, NUNCA
cadena vacía.

#### Scenario: Sin datos

- GIVEN `undefined`, `null`, `[]` o `["  "]`
- WHEN se llama `formatAllergenLabel`
- THEN devuelve `"Consultá antes de comprar: información de alérgenos no disponible."`
