# Documentación — SACRÉ e-shop

> Índice de la documentación del proyecto **SACRÉ** (`E:/sitios web E/SACRÉ/sacre-shop`). Developer-focused: acá aterriza cualquier `.md` suelto del repo; el README raíz queda como landing de setup.

## Índice

| Documento | Contenido |
|---|---|
| [`stack-framework.md`](stack-framework.md) | **Baseline stack**: Next 16 + React 19 + Tailwind 4, Supabase, MP, Resend; arquitectura, setup y convenciones. |
| [`funciones-ecommerce.md`](funciones-ecommerce.md) | **Baseline funciones**: catálogo, carrito, checkout, pagos/webhook, admin, contenido y pendientes F1–F5. |
| [`branding-identidad-visual.md`](branding-identidad-visual.md) | **Baseline branding**: paleta, tipografías Cronde/Montserrat, glassmorphism, fotografía. |
| [`reporte-producto-marketing-estilo-2026-09-14.md`](reporte-producto-marketing-estilo-2026-09-14.md) | **Doc de producto**: qué es, catálogo, flujo de checkout/webhook MP, admin, tono de marketing, identidad visual, estado y próximos pasos (F1–F5). |
| [`07-repos-relacionados.md`](07-repos-relacionados.md) | Repos relacionados: dónde vive cada cosa del ecosistema SACRÉ (mapeo por proyecto). |
| [`STATUS.md`](STATUS.md) | **Estado técnico** verificado 2026-09-15: build, tests, DB, cumplimiento vs spec y pendientes F1–F5. |
| [`../README.md`](../README.md) | Landing de setup del repo (Stack, Struktura, Spec y fases). |

## Mapas de referencia (fuera del repo, canónicos)

Estos viven en `E:/Hermes/docs/plans/` y no se duplican acá:

- `project-map.md` — carpeta / Supabase / Linear por proyecto (resolver siempre por esté, no por nombre).
- `sacre-spec.md` — spec del dueño 2026-09-14: modelo de datos mínimo, RLS, fases F1–F5, slice MVP.

## Convenciones

- Cada pasada de auditoría/generación aterriza acá como `.md` con fecha (`YYYY-MM-DD`) en el nombre.
- No duplicar docs de `E:/Hermes/docs/plans/`; referenciarlos en el índice con ruta.
- Los `.md` del repo sueltos en raíz se consolidan en `docs/`.