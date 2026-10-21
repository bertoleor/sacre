-- =============================================================================
-- SACRÉ e-shop — Down de 0003 (admin auth — P0-1)
-- Revierte 0003_admin_auth.sql: elimina policies admin, función is_admin y
-- tabla admin_users. NO restaura las policies genéricas authenticated de 0001
-- (eran "cualquier signup = admin", ya removidas por 0002 con justificación).
-- Idempotente.
-- =============================================================================

drop policy if exists "products_admin_read_all"     on public.products;
drop policy if exists "products_admin_write"        on public.products;
drop policy if exists "categories_admin_read_all"   on public.product_categories;
drop policy if exists "categories_admin_write"     on public.product_categories;
drop policy if exists "orders_admin_all"            on public.orders;
drop policy if exists "order_items_admin_all"      on public.order_items;
drop policy if exists "notifications_admin_all"     on public.notifications;

drop function if exists public.is_admin();

-- Grants restituidos por 0003 a authenticated: fuera (estado 0002 restaurado).
revoke insert, update, delete on public.products           from authenticated;
revoke insert, update, delete on public.product_categories from authenticated;
revoke insert, update, delete on public.orders             from authenticated;
revoke insert, update, delete on public.order_items        from authenticated;
revoke insert, update, delete on public.notifications      from authenticated;

drop table if exists public.admin_users;
