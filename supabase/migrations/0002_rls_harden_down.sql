-- =============================================================================
-- SACRÉ e-shop — Down de la migración 0002 (RLS harden) — P0-3 F1
-- Restaura EXACTAMENTE el estado que 0001_init.sql dejó (grants Supabase
-- default + policies genéricas authenticated), para rollback probado.
--
-- ADVERTENCIA: este down re-abre los grants de escritura de anon y las
-- policies `authenticated` genéricas que 0002 cerró. Es solo para rollback
-- de emergencia (P2-25: rollback por comportamiento); re-aplicar 0002 tras
-- diagnosticar.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Policies genéricas `authenticated` restauradas (como en 0001)
-- -----------------------------------------------------------------------------
create policy "orders_admin_access" on public.orders
    for all to authenticated with check (true);

create policy "order_items_admin_access" on public.order_items
    for all to authenticated with check (true);

create policy "notifications_admin_access" on public.notifications
    for all to authenticated with check (true);

create policy "products_admin_write" on public.products
    for all to authenticated with check (true);

create policy "products_admin_read_all" on public.products
    for select to authenticated using (true);

create policy "categories_admin_write" on public.product_categories
    for all to authenticated with check (true);

-- -----------------------------------------------------------------------------
-- 2. Grants restaurados al default de Supabase (all on public.* a ambos roles)
-- -----------------------------------------------------------------------------
grant all on all tables in schema public to anon;
grant all on all tables in schema public to authenticated;

alter default privileges in schema public grant insert, update, delete, truncate on tables to anon;
alter default privileges in schema public grant insert, update, delete, truncate on tables to authenticated;

-- Nota: las policies de SELECT público de 0001 (products_public_read_active,
-- categories_public_read) no fueron tocadas por 0002 y siguen vigentes.
