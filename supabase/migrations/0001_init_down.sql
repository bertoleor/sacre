-- =============================================================================
-- SACRÉ e-shop — Down de la migración 0001 (init) — P0-3 F1
-- Retro-fit del gate DBA (dev-protocol: "migración sin down.sql = bloqueada").
-- Revierte el esquema completo: deja la DB con 0 tablas public y sin RLS.
--
-- ORDEN: ejecutar SOLO después de 0002_rls_harden_down.sql si se quiere
-- volver a la DB vacía (drop tables + funciones + extensiones + grants).
-- ADVERTENCIA: destructivo — borra products/seed/órdenes. Solo rollback total.
-- =============================================================================

drop policy if exists "products_public_read_active" on public.products;
drop policy if exists "categories_public_read"      on public.product_categories;

drop trigger if exists products_set_updated_at on public.products;
drop trigger if exists orders_set_updated_at   on public.orders;

drop table if exists public.order_items;
drop table if exists public.notifications;
drop table if exists public.orders;
drop table if exists public.products;
drop table if exists public.product_categories;

drop function if exists public.set_updated_at();
drop extension if exists "uuid-ossp";

revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;
