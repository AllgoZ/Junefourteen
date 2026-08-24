-- JUNEFOURTEEN production schema.
-- Mirrors types/product.ts, types/cart.ts, types/shipping.ts exactly — see
-- Phase 2 of the implementation plan for the full rationale per table,
-- especially why product_collections is a join table (products belong to
-- multiple collections) instead of the single collection_id the original
-- brief suggested.

-- ── profiles ────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── collections ─────────────────────────────────────────────────────────
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  tone numeric not null default 0.5,
  image_url text,
  image_alt text,
  cloudinary_public_id text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index collections_is_active_idx on public.collections (is_active);

-- ── products ────────────────────────────────────────────────────────────
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  short_description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  compare_at_price numeric(10, 2) check (compare_at_price is null or compare_at_price >= 0),
  category text not null,
  tags text[] not null default '{}',
  is_new boolean not null default false,
  is_best_seller boolean not null default false,
  is_sold_out boolean not null default false,
  is_active boolean not null default true,
  custom_size_enabled boolean not null default false,
  fabric text not null default '',
  wash_care text[] not null default '{}',
  shipping_info text not null default '',
  fit_notes text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products (category);
create index products_is_active_idx on public.products (is_active);
create index products_is_new_idx on public.products (is_new);
create index products_is_best_seller_idx on public.products (is_best_seller);
create index products_is_sold_out_idx on public.products (is_sold_out);
create index products_price_idx on public.products (price);
create index products_tags_idx on public.products using gin (tags);

-- ── product_collections (many-to-many; a product can be in several collections) ──
create table public.product_collections (
  product_id uuid not null references public.products (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (product_id, collection_id)
);

create index product_collections_collection_id_idx on public.product_collections (collection_id);

-- ── product_images ──────────────────────────────────────────────────────
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  cloudinary_public_id text,
  image_url text not null,
  alt text not null default '',
  tone numeric not null default 0.5,
  width integer,
  height integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index product_images_product_id_idx on public.product_images (product_id);

-- ── product_sizes ───────────────────────────────────────────────────────
create table public.product_sizes (
  product_id uuid not null references public.products (id) on delete cascade,
  size text not null check (size in ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  sort_order integer not null default 0,
  primary key (product_id, size)
);

-- ── product_sleeve_options ──────────────────────────────────────────────
create table public.product_sleeve_options (
  product_id uuid not null references public.products (id) on delete cascade,
  sleeve_option text not null check (
    sleeve_option in ('Sleeveless', '3/4 Sleeve', 'Full Sleeve', '18" Sleeve')
  ),
  sort_order integer not null default 0,
  primary key (product_id, sleeve_option)
);

-- ── addresses ───────────────────────────────────────────────────────────
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index addresses_user_id_idx on public.addresses (user_id);

-- ── carts / cart_items ──────────────────────────────────────────────────
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  size text check (size in ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  sleeve_option text check (
    sleeve_option in ('Sleeveless', '3/4 Sleeve', 'Full Sleeve', '18" Sleeve')
  ),
  custom_measurements jsonb,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cart_items_cart_id_idx on public.cart_items (cart_id);
create index cart_items_product_id_idx on public.cart_items (product_id);

-- Reproduces components/providers/cart-provider.tsx's buildLineId exactly:
-- standard lines merge on product+size+sleeve (missing size/sleeve treated
-- as "std"/"any", matching the client's ?? fallback), custom-measurement
-- lines never merge.
create unique index cart_items_line_identity_idx on public.cart_items (
  cart_id,
  product_id,
  coalesce(size, 'std'),
  coalesce(sleeve_option, 'any')
)
where custom_measurements is null;

-- ── wishlist_items ──────────────────────────────────────────────────────
create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index wishlist_items_user_id_idx on public.wishlist_items (user_id);

-- ── orders / order_items ────────────────────────────────────────────────
create sequence public.order_number_seq;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique
    default ('JF-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 6, '0')),
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  phone text not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  subtotal numeric(10, 2) not null,
  shipping_amount numeric(10, 2) not null default 0,
  discount_amount numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  currency text not null default 'INR',
  shipping_address jsonb not null,
  billing_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index orders_email_idx on public.orders (email);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_slug text not null,
  product_image text,
  unit_price numeric(10, 2) not null,
  quantity integer not null check (quantity > 0),
  selected_size text,
  selected_sleeve_option text,
  custom_measurements jsonb,
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items (order_id);
