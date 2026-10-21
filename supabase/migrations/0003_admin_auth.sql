-- =============================================================================
-- SACRÉ e-shop — Migración 0003 (admin auth — P0-1)
-- Reemplaza la "auth" hardcodeada sacre/chocolate (P0-1) por Supabase Auth
-- real con policies admin basadas en membership:
--   - public.admin_users: (id uuid PK, role text, created_at) — id = auth.users.id
--   - public.is_admin(): SECURITY DEFINER, stable — membership check
--   - policies admin para authenticated SOLO con is_admin() en:
--     products, product_categories, orders, order_items, notifications
--
-- Contrato heredado de 0002 (P0-3 F1, commit 13e5118):
--   "Las policies admin se montan en P0-1 sobre este esquema" — este archivo
--   ES esa parte. Las 6 invariantes de scripts/rls_audit.py siguen en GREEN:
--   ningún grant write a anon/authenticated, ninguna policy PUBLIC, ningún
--   cmd=ALL para authenticated sin gate.
--
-- Orden: 0001_init.sql → 0002_rls_harden.sql → 0003_admin_auth.sql.
-- Down: 0003_admin_auth_down.sql.
-- Idempotente: if not exists / create or replace / drop policy if exists.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. admin_users — registro de admins (quién es admin lo decide el owner,
--    insertando la fila desde el dashboard/SQL; no hay signup self-service).
-- -----------------------------------------------------------------------------
create table if not exists public.admin_users (
    id          uuid not null references auth.users (id) on delete cascade,
    role        text not null default 'admin',
    created_at  timestamptz not null default now(),
    primary key (id, role)
);

alter table public.admin_users enable row level security;

-- Sin policies: nadie (ni anon ni authenticated) lee/escribe admin_users vía
-- API. El membership se consulta SOLO desde is_admin() (SECURITY DEFINER).
revoke all on public.admin_users from anon, authenticated;

-- -----------------------------------------------------------------------------
-- 2. is_admin() — membership check. SECURITY DEFINER para poder leer
--    admin_users desde policies sin exponer la tabla. stable: el planner la
--    reutiliza dentro de un statement; el JWT no cambia intra-query.
--    Maneja sub null (anon) y JSON anómalo sin explotar.
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.admin_users au
        where au.id = auth.uid()
    );
$$;

-- -----------------------------------------------------------------------------
-- 3. Policies admin sobre las tablas operativas. SOLO authenticated + gate
--    is_admin(). Reemplazan a las genéricas removidas en 0002.
--    El storefront público sigue por las policies SELECT de 0001 (anon,
--    is_active) — intocadas acá.
-- -----------------------------------------------------------------------------
-- products: admin lee TODO (incluye inactivos), escribe con gate
drop policy if exists "products_admin_read_all" on public.products;
create policy "products_admin_read_all" on public.products
    for select
    to authenticated
    using (public.is_admin());

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
    for all
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- product_categories: idem products
drop policy if exists "categories_admin_read_all" on public.product_categories;
create policy "categories_admin_read_all" on public.product_categories
    for select
    to authenticated
    using (public.is_admin());

drop policy if exists "categories_admin_write" on public.product_categories;
create policy "categories_admin_write" on public.product_categories
    for all
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- orders: admin full access; ningún otro authenticated ve nada
drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all" on public.orders
    for all
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- order_items: idem orders
drop policy if exists "order_items_admin_all" on public.order_items;
create policy "order_items_admin_all" on public.order_items
    for all
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- notifications: idem orders
drop policy if exists "notifications_admin_all" on public.notifications;
create policy "notifications_admin_all" on public.notifications
    for all
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- 4. Grants: restituir DML a authenticated en las tablas admin.
--    0002 revoco insert/update/delete/truncate de authenticated en TODO public
--    (necesario entonces: las policies genericas no gateaban nada). Con el
--    gate is_admin() montado, el acceso real de authenticated queda definido
--    por RLS: sin fila en admin_users -> 0 filas visibles/escribibles.
--    anon sigue SIN grants de write (invariante 6 de rls_audit.py intacta).
-- -----------------------------------------------------------------------------
grant select, insert, update, delete on public.products          to authenticated;
grant select, insert, update, delete on public.product_categories to authenticated;
grant select, insert, update, delete on public.orders           to authenticated;
grant select, insert, update, delete on public.order_items      to authenticated;
grant select, insert, update, delete on public.notifications   to authenticated;

-- -----------------------------------------------------------------------------
-- 5. Invariantes que deja este archivo (scripts/auth_rls_verify.py las prueba):
--    A. admin_users: RLS on, sin grants write anon/auth, FK -> auth.users
--    B. is_admin(): security definer + stable
--    C. toda policy write authenticated de tablas admin gateada con is_admin()
--    D. signup público deshabilitado (se setea en config auth, no acá)
-- -----------------------------------------------------------------------------
