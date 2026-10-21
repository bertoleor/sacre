# El pasaje JUNK de 2026-03-07 — 6 commits "aa / AA / red point" que cargan la primera versión del e-shop

> **Búsqueda:** keywords: `sacre-shop, junk-commits, red-point, d64cbb8, 3c696b1, 0ad9155, e991d29, 8199acc, 142a503, historia-git, p1-6` · clasificación: `referencia` · estado: `canónico` · actualizado: 2026-10-20

**Qué es esto.** Entre los primeros commits de este repo hay una maratón de pushes del 2026-03-07 con mensajes vacíos (`aa`, `AA`, `red point`). El ticket P1-6 (barrido 2026-09-16) los citaba como "commits JUNK" a squashear. La auditoría P1-6 (2026-09-30, flota Hermes, verificado con `git show --shortstat` + gitleaks full-history) concluyó que **no son basura: son trabajo real con mensaje pésimo** — el diff acumulado de estos 6 commits es la primera versión funcional del ecommerce (checkout Mercado Pago, webhook, cliente Supabase, admin completo). Este doc fija el registro para que nadie "limpie" esa historia a futuro sin saber qué contiene.

**Carga total del pasaje: +7.038 / −2.217 líneas sumando los 6 commits.**

| Hash | Fecha | Msg | Carga (+/−) | Contenido real |
|---|---|---|---|---|
| `d64cbb8` | 2026-03-07 | `red point` | +4.356/−2.060 (47 files) | **Borra** `ARREGLO_VERCEL.md`, `DEPLOY_VERCEL.md`, `SUBIR_A_GITHUB.md`, `subir-cambios.bat`, `tailwind.config.ts`. **Agrega**: checkout Mercado Pago completo, `api/orders/create`, webhook MP, cliente Supabase, 8 `loading.tsx`, `.env.example` (siempre placeholders), imágenes. |
| `3c696b1` | 2026-03-07 | `red point` | +107/−74 (14 files) | Cambio de color a rojo en 14 archivos UI (botones, carrusel, navbar) — el "red point" literal. |
| `0ad9155` | 2026-03-07 | `aa` | +16/−16 (3 files) | Carrusel y grid. |
| `e991d29` | 2026-03-07 | `aa` | +37/−35 (7 files) | Contacto, footer, hero, divisores. |
| `8199acc` | 2026-03-07 | `aa` | +1.449/−11 (11 files) | **El admin COMPLETO de la tienda** (login, pedidos, productos, layout). Trajo las credenciales hardcodeadas que hoy viven en P0-1 (abierto). |
| `142a503` | 2026-03-07 | `AA` | +1.073/−21 (6 files) | Admin `productos/[id]` edición, página términos, `package-lock.json` +819 líneas. |

## Por qué NO se reescribió la historia (decisión auditada 2026-09-30)

- **gitleaks full-history limpio** (37 commits escaneados, "no leaks found", EXIT=0): no hay justificación de seguridad para purgar historia.
- Los archivos "sueltos" que motivaban el ticket (`ARREGLO_VERCEL.md`, `subir-cambios.bat`) **ya fueron borrados de la raíz en el propio `d64cbb8`** — solo viven como blobs muertos en historial.
- Un squash reescribiría 18 de 22 hashes con 9 ramas vivas (4 `fea/sacre-*` con trabajo terminado nunca mergeado), receipts RDD congelando hashes viejos y sin branch protection en el repo. Riesgo alto, beneficio cosmético.

En cambio se ejecutó la **Opción A** (LGTM owner 20/10/2026): untrack de los sueltos vivos (`sacre_build.log` + 2 receipts `.rdd/` que estaban trackeados pese al ignore), `.gitignore` cubriendo receipts RDD y logs locales, y este registro documental. Todo reversible con `git revert`; sin force-push en ningún momento.

**Fuente (informe de auditoría completo, flota Hermes):** `E:/Hermes/docs/audits/2026-09-30-sacre-p1-6-archivos-sueltos-commits-junk.md` · ticket kanban t_139b8f7e.
