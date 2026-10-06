-- =============================================================================
-- SACRÉ e-shop — Migración 0002 (RLS harden — P0-3 F1)
-- Endurece el esquema 0001 para cumplir el gate del ticket P0-3:
--   "RLS sin PUBLIC abierto" + grants anon/authenticated cerrados.
--
-- Problema que resuelve (verificado en vivo 2026-10-06, ref qirzicgqqmcqlvyqskkv):
--   1. 0001 habilitó RLS pero NUNCA revocó los grants heredados de Supabase
--      (GRANT ALL on public.* to anon, authenticated). anon conserva
--      INSERT/UPDATE/DELETE/TRUNCATE en las 5 tablas — a una policy mal
--      montada del desastre.
--   2. Las policies *_admin_access (orders/order_items/notifications,
--      products_admin_write, categories_admin_write) dan cmd=ALL a
--      `authenticated` con with_check(true). En Supabase `authenticated`
--      es CUALQUIER usuario con signup, no "admin". Cualquier signup podía
--      leer y escribir TODAS las órdenes y el catálogo completo.
--
-- Decisiones (del ticket, no re-decididas acá):
--   - Tablas admin/auth: Supabase Auth llega en P0-1 (card t_c3f1cbc2, 29-auth).
--     Las policies admin se montan ALLÍ sobre este esquema. Acá se remueven
--     las policies genéricas `authenticated` para que P0-1 las reemplace con
--     las reales (basadas en auth.users / roles reales).
--   - Runtime del storefront/checkout/admin actual: TODO pasa por
--     createServerClient() con SUPABASE_SERVICE_ROLE_KEY (bypass RLS):
--     lib/catalog.ts, app/api/orders/create, webhook MP. Ningún código vivo
--     depende de grants anon/authenticated de escritura. Solo el SELECT
--     público (products activos + categories) se conserva.
--   - NO se usa FORCE row level security: el service_role del checkout
--     necesita bypass RLS para insertar orders de guest (no hay auth de
--     clientes todavía). P0-1 revisita.
--
-- Down: 0002_rls_harden_down.sql (restaura grants + policies de 0001).
-- Idempotente: todos los statements son if exists / a prueba de re-run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Grants: cerrar escritura de anon y authenticated en TODO public
--    (anon queda solo con SELECT, sujeto a RLS: products activos + categories)
-- -----------------------------------------------------------------------------
revoke insert, update, delete, truncate on all tables in schema public from anon;
revoke insert, update, delete, truncate on all tables in schema public from authenticated;

-- Default privileges: lo que se cree a futuro tampoco hereda write para anon/auth
alter default privileges in schema public revoke insert, update, delete, truncate on tables from anon;
alter default privileges in schema public revoke insert, update, delete, truncate on tables from authenticated;

-- -----------------------------------------------------------------------------
-- 2. Policies genéricas `authenticated` → fuera hasta P0-1
--    (eran "cualquier signup = admin": ALL + with_check(true))
-- -----------------------------------------------------------------------------
drop policy if exists "orders_admin_access"         on public.orders;
drop policy if exists "order_items_admin_access"   on public.order_items;
drop policy if exists "notifications_admin_access" on public.notifications;
drop policy if exists "products_admin_write"       on public.products;
drop policy if exists "products_admin_read_all"    on public.products;
drop policy if exists "categories_admin_write"     on public.product_categories;

-- -----------------------------------------------------------------------------
-- 3. Lectura pública: queda EXACTAMENTE definida por las policies SELECT
--    conservadas de 0001 (con qual restrictivo, no with_check abierto):
--      - products_public_read_active: select where is_active = true
--      - categories_public_read:      select (catálogo de categorías)
--    Escrituras: service_role (checkout/admin server-side) exclusivamente.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- 4. Verificación de invariantes (el audit script las re-chequea post-apply):
--    - RLS ON en las 5 tablas public
--    - 0 policies con rol PUBLIC
--    - 0 policies de write para anon
--    - anon sin grants de INSERT/UPDATE/DELETE/TRUNCATE
--    - products: select público solo is_active = true
-- -----------------------------------------------------------------------------
