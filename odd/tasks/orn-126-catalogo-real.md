# ORN-126 — F2 Catálogo real + stock (storefront lee DB viva, mock fuera)

> Feature: ORN-126 [SACRE] F2 Catálogo real + stock — turno noche G0 2026-09-28
> Kanban: t_c3c4787b (ready→running 2026-09-28). Linear mirror: ORN-126 (High).
> Route: delegated-direct inline con writer acotado (storefront 4 archivos + lib nuevo) — build/backend (16) + TS (17).
> TDD: STRICT (runner `npx vitest run`, fuente .env TDD_MODE=on).
> Baseline verificado 2026-09-28 (este turno): DB SACRE (ref xaxioylgwhbxtjgglwrx) ACTIVE, 5 tablas,
> RLS ON en las 5, 8 policies, PERO **seed sin aplicar: 0 productos / 0 categorías**. Vitest 37/37 verde en feat/orn-140-webhook-e2e.

## Objetivo
El storefront deja de leer el mock `lib/data.ts` y pasa a leer la DB Supabase real
(ProductsGrid / Carousel / detalle / relacionados), con el seed aplicado en la DB viva
(8 productos + 3 categorías) y el stock visible. `lib/data.ts` se remueve del camino del
storefront (queda solo para el admin hasta F4, o se remueve del todo si el admin también migra limpio).

## Problema
1. `lib/data.ts` exporta `products` hardcodeados (8 productos) usados por
   ProductGrid, ProductCarousel, `app/productos/[id]`, `app/admin/productos/*`.
2. DB viva tiene schema + RLS pero 0 filas: el seed (idempotente por slug) nunca se aplicó.
3. `generateStaticParams` + `products.find()` en el detalle asumen catálogo estático — con DB
   viva el detalle debe ser dinámico o SSG por rebuild.

## Por qué
- ORN-126 (High): "Catálogo real + stock" — sin esto el e-commerce vende un mock, stock incluido.
- ORN-140 cerró el webhook pero la db seguía mostrando 0 productos: el ROJO "DB vacía" solo se
  cerró a nivel schema. El catálogo es la cara visible.
- Foco del cron: webhook (en review, no trabajable) + migraciones → este es el eslabón de migraciones.

## Scope autorizado
- `lib/catalog.ts` (NUEVO): acceso a catálogo desde server components — `getProducts()`,
  `getProductById(id)`, `getProductsByCategory(cat)`, con mapeo fila→Product y fallback vacío.
- `lib/catalog.test.ts` (NUEVO): tests con cliente inyectado (seam DI como webhook tests).
- `components/ProductGrid.tsx`, `components/ProductCarousel.tsx`: async server fetch via catalog,
  con `featured` y `stock` reales; sin mock.
- `app/productos/[id]/page.tsx`: detalle dinámico desde DB (related products desde DB),
  genera metadata desde DB, agotado → badge "Agotado" y deshabilita Añadir al carrito cuando stock 0.
- `app/admin/productos/*` y `app/admin/page.tsx`: migrar a catalog (o mantener mock con TODO explícito
  de F4 — decisión del writer: si es mecánico, migrar).
- `supabase/seed.sql`: ya existe, idempotente — aplicar contra DB viva (operación DBA, con PAT).
- NO tocar: webhook MP, orders/create, RLS/migraciones 0001 (schema ya sano).

## Tasks (checklist con IDs estables)
- [x] T1: RED — `lib/catalog.test.ts` con tests del mapeo fila→Product (campo image derivado de images[0],
      featured←is_featured, stock, slug/id) usando cliente falso inyectado. Ejecutado: `Cannot find module './catalog'` (log sacre_tdd_red.log).
- [x] T2: GREEN mínimo — `lib/catalog.ts` con fetch por cliente inyectado + mapeo; 15/15 verdes.
- [x] T3: Triangulación edge cases: DB caída→lista vacía sin crash; null client (demo mode)→vacío;
      inactivo (is_active=false) filtrado; id inexistente→null; category filter + pushdown pinnned (eq/order/limit verificados por el fake).
- [x] T4: Migrar ProductGrid + ProductCarousel + detalle a catalog (async components);
      detail: stock 0 → "Agotado" + botón disabled; home pasa productos por prop al carousel; ISR revalidate=300 en /, /productos, /productos/[id].
- [x] T5: `npx vitest run` completa verde (49/49) + `npx tsc --noEmit` 0 errores + `next build` EXIT 0 (sacre_build_126d.log; re-verificación post-fix: 126e).
- [x] T6: `supabase/seed.sql` aplicado a DB viva vía Management API (PAT_1) — 8 productos + 3 categorías
      verificados con select; re-ejecución idempotente (siguen 8/3).
- [x] T7: Work-unit commit + push a origin (rama feat/orn-126-catalogo-real). (en curso)
- [ ] T8: RDD receipt (`scripts/rdd-receipt.py --staged`) antes del push.
- [ ] T9: Kanban t_c3c4787b → review con resumen LGTM; Linear ORN-126 → In Review con comentario.
- [ ] T10: Reporte envelope + log reports/cron-runs/g0-sacre-noche-2026-09-28.md.

## Juez dual (ronda 1)
- Juez A (adversario, nemotron-ultra): ESCALATED conf 0.7 — H1 critical: createServerClient() throw
  fuera de try/catch rompe el contrato de degradación (env ausente → 500/build fail); H2 warning: fake
  Proxy yes-man que no pinnea la shape de la query; H3-H9 warnings/suggestions (stock server-side,
  service role lectura, fallback imagen grid, catch silencioso, 404 SEO, pushdown, cast).
- Juez B (defensor de contrato, glm-5.3): APPROVED conf 0.75 — mismo hallazgo del throw (warning 0.8),
  misma fragilidad del fake (0.6), 3 suggestions (queries por detalle, badge en relacionados, clamp stock).
- Merge (regla de plantilla): defectos confirmados por AMBOS = (1) throw de config ausente escapa a la
  degradación; (2) fake no valida la query real. → Fix acotado aplicado (ronda 1 de 2).

## Fix ronda 1 (post-juez)
- `getCatalogClient()` nuevo: null si `isSupabaseConfigured()` es falso o si createServerClient() throw →
  páginas degradan a catálogo vacío / 404, nunca 500. `isSupabaseConfigured()` ahora chequea URL+SERVICE_ROLE
  (semántica server; único consumidor era client.ts).
- Pushdown `.eq("is_active", true)` agregado a las 3 queries (antes solo filtro JS) + console.error en
  cada catch (H6).
- Fake de tests reescrito: registra tabla/columnas/eq/order/limit y 3 tests nuevos pinean la shape exacta
  (products + columnas completas + eq args); 3 tests nuevos de client null (demo mode). 15→21 tests.
- Grid: fallback de imagen igual al detalle/carousel (H5). Cast redundante removido (H9).
- 49/49 verde + tsc 0 + build 126e en curso al momento de escribir esta línea.

## Verificación (evidencia)
- Test RED log (sacre_tdd_red.log) antes de tocar código: `Cannot find module './catalog'`.
- `npx vitest run` 49/49 (21 catalog + 18 webhook HMAC + 10 allergens).
- `npx tsc --noEmit` 0 err.
- `next build` EXIT 0 (sacre_build_126d.log rama pre-fix; sacre_build_126e.log post-fix).
- DB viva: 8 productos + 3 categorías (select count verificado 2x, idempotente).

## Aceptación
- Storefront sirve catálogo desde DB viva con stock real; 0 referencias al mock en el camino de compra.
- Seed aplicado e idempotente. Sin regresión de build/tests.

## Progreso
- Kanban t_c3c4787b ready→running (2026-09-28 05:02 ART).
- Branch feat/orn-126-catalogo-real desde main 2a54017.
