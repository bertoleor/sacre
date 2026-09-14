-- =============================================================================
-- SACRÉ e-shop — Migración 0001 (init)
-- Modelo de datos mínimo decidido por el orquestador (ver sacre-spec.md).
-- Orden de ejecución del seed: este archivo primero, luego supabase/seed.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- extensiones
-- -----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- product_categories
-- -----------------------------------------------------------------------------
create table if not exists public.product_categories (
    id          uuid primary key default uuid_generate_v4(),
    slug        text not null unique,
    name        text not null,
    icon        text,
    created_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- products
-- -----------------------------------------------------------------------------
create table if not exists public.products (
    id                uuid primary key default uuid_generate_v4(),
    slug              text not null unique,
    name              text not null,
    description       text,
    price             integer not null default 0,
    compare_at_price  integer,
    category          text,
    stock             integer not null default 0,
    sku               text,
    images            text[] not null default '{}',
    is_active         boolean not null default true,
    is_featured       boolean not null default false,
    tags              text[] not null default '{}',
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now()
);

create index if not exists products_slug_idx          on public.products (slug);
create index if not exists products_active_idx        on public.products (is_active);
create index if not exists products_featured_idx      on public.products (is_featured);
create index if not exists products_category_idx      on public.products (category);

-- -----------------------------------------------------------------------------
-- orders
-- -----------------------------------------------------------------------------
create table if not exists public.orders (
    id                          uuid primary key default uuid_generate_v4(),
    order_number                text not null unique,
    user_id                     uuid,
    guest_email                 text,
    status                      text not null default 'pending',
    customer_first_name         text,
    customer_last_name          text,
    customer_email              text,
    customer_phone              text,
    shipping_method             text,
    shipping_address_line1      text,
    shipping_address_line2      text,
    shipping_city               text,
    shipping_state              text,
    shipping_postal_code        text,
    shipping_instructions       text,
    payment_method              text,
    payment_status              text not null default 'pending',
    payment_id                  text,
    payment_external_reference  text,
    subtotal                    integer not null default 0,
    shipping_cost               integer not null default 0,
    discount                    integer not null default 0,
    total                       integer not null default 0,
    internal_notes              text,
    admin_notes                 text,
    created_at                  timestamptz not null default now(),
    updated_at                  timestamptz not null default now(),
    paid_at                     timestamptz,
    shipped_at                  timestamptz,
    delivered_at                timestamptz,
    cancelled_at                timestamptz
);

create index if not exists orders_number_idx on public.orders (order_number);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_payment_status_idx on public.orders (payment_status);

-- -----------------------------------------------------------------------------
-- order_items (snapshot de producto al momento de la compra)
-- -----------------------------------------------------------------------------
create table if not exists public.order_items (
    id            uuid primary key default uuid_generate_v4(),
    order_id      uuid not null references public.orders (id) on delete cascade,
    product_id    uuid references public.products (id) on delete set null,
    product_name  text,
    product_sku   text,
    product_image text,
    quantity      integer not null default 1,
    unit_price    integer not null default 0,
    subtotal      integer not null default 0,
    created_at    timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- -----------------------------------------------------------------------------
-- notifications (el webhook de Mercado Pago inserta acá)
-- -----------------------------------------------------------------------------
create table if not exists public.notifications (
    id         uuid primary key default uuid_generate_v4(),
    order_id   text,
    type       text,
    title      text,
    message    text,
    read       boolean not null default false,
    created_at timestamptz not null default now()
);

create index if not exists notifications_order_idx on public.notifications (order_id);

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
    before update on public.products
    for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
    before update on public.orders
    for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- RLS
--   - products: lectura pública SOLO de los activos; escrituras solo service_role
--     y/o admin autenticado. El checkout y el admin usan service_role (bypass RLS).
--   - orders/order_items/notifications/products (escritura): solo service_role
--     + admin autenticado, nunca anon directo.
-- -----------------------------------------------------------------------------
alter table public.products         enable row level security;
alter table public.order_items      enable row level security;
alter table public.orders           enable row level security;
alter table public.notifications    enable row level security;
alter table public.product_categories enable row level security;

-- Lectura pública: solo productos activos
create policy "products_public_read_active" on public.products
    for select
    to anon, authenticated
    using (is_active = true);

-- Admin autenticado: lectura completa
create policy "products_admin_read_all" on public.products
    for select
    to authenticated
    using (true);

-- Admin autenticado: escritura completa (insert/update/delete)
create policy "products_admin_write" on public.products
    for all
    to authenticated
    with check (true);

-- product_categories: lectura pública
create policy "categories_public_read" on public.product_categories
    for select
    to anon, authenticated
    using (true);

create policy "categories_admin_write" on public.product_categories
    for all
    to authenticated
    with check (true);

-- orders / order_items / notifications: solo service_role + admin autenticado
create policy "orders_admin_access" on public.orders
    for all
    to authenticated
    with check (true);

create policy "order_items_admin_access" on public.order_items
    for all
    to authenticated
    with check (true);

create policy "notifications_admin_access" on public.notifications
    for all
    to authenticated
    with check (true);