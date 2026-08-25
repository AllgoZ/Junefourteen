-- Replaces the static lib/shipping/rate-table.ts with admin-managed zones,
-- adds coupon codes (orders.discount_amount already existed but was never
-- wired to anything), and a single global tax rate. See lib/services/
-- shipping.ts, lib/services/coupons.ts, lib/services/tax.ts and the admin
-- pages under app/admin/(protected)/{shipping,coupons}/ + the Tax card on
-- /admin/settings.

create table public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  states text[] not null default '{}',
  rate numeric(10, 2) not null,
  free_shipping_threshold numeric(10, 2),
  eta_min_days integer not null,
  eta_max_days integer not null,
  is_default boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shipping_zones_is_active_idx on public.shipping_zones (is_active);

create trigger set_updated_at before update on public.shipping_zones
  for each row execute function public.set_updated_at();

-- No policies on any of the three tables below: every read/write goes
-- through the service-role client (checkout Server Actions, admin pages) —
-- RLS-enabled-with-no-policies is a default-deny, same as orders/order_items.
alter table public.shipping_zones enable row level security;

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10, 2) not null,
  min_order_amount numeric(10, 2) not null default 0,
  max_discount_amount numeric(10, 2),
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit integer,
  times_used integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index coupons_code_idx on public.coupons (code);

create trigger set_updated_at before update on public.coupons
  for each row execute function public.set_updated_at();

alter table public.coupons enable row level security;

-- Singleton row (standard Postgres one-row-table trick: a boolean PK that
-- can only ever be `true`, so a second insert always collides).
create table public.tax_settings (
  id boolean primary key default true check (id),
  rate_percent numeric(5, 2) not null default 0,
  label text not null default 'GST',
  is_active boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.tax_settings (id) values (true);

create trigger set_updated_at before update on public.tax_settings
  for each row execute function public.set_updated_at();

alter table public.tax_settings enable row level security;

alter table public.orders
  add column tax_amount numeric(10, 2) not null default 0,
  add column coupon_code text;
