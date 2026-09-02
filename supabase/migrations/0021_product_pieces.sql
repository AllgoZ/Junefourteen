-- Per-piece product pricing (e.g. a kurta set sold as Top / Bottom /
-- Dupatta). A product with zero product_pieces rows behaves exactly as
-- before — one products.price. A product with pieces lets the customer tick
-- any combination on the PDP (at least one), and the price shown/charged is
-- the SUM of the ticked pieces' prices. Size stays a separate choice.
--
-- product_pieces is a plain child table like product_sizes /
-- product_sleeve_options — a per-piece availability + price list, NOT a
-- separately-stocked SKU. is_sold_out stays product-level and the sole
-- purchase gate (same reasoning as 0008_inventory.sql).

create table public.product_pieces (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null,
  price numeric(10, 2) not null check (price >= 0),
  default_selected boolean not null default true,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index product_pieces_product_id_idx on public.product_pieces (product_id);

create trigger set_updated_at before update on public.product_pieces
  for each row execute function public.set_updated_at();

-- Public catalog read, gated on the parent product being active — identical
-- shape to product_images/product_sizes/product_sleeve_options in
-- 0003_rls.sql. Admin writes go through the service-role client only (see
-- 0003_rls.sql's header comment), so there is no write policy.
alter table public.product_pieces enable row level security;

create policy "product_pieces_public_read" on public.product_pieces
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.is_active = true)
  );

-- ── cart_items: which pieces a line has selected ────────────────────────
-- jsonb array of product_pieces.id strings, null for non-piece products —
-- same "extra optional line attribute" convention as custom_measurements.
alter table public.cart_items add column selected_piece_ids jsonb;

-- The line-identity partial unique index reproduces cart-provider.tsx's
-- buildLineId. Piece lines (like custom-measurement lines) are matched and
-- merged purely in application code — lib/repositories/cart.ts#matchesLine
-- and components/providers/cart-provider.tsx#buildLineId compare the sorted
-- piece-id arrays — so they are excluded from this DB index (see
-- ARCHITECTURE.md §14: the app logic is the real enforcement, the index is
-- belt-and-suspenders the JS upsert() can't target anyway).
drop index public.cart_items_line_identity_idx;

create unique index cart_items_line_identity_idx on public.cart_items (
  cart_id,
  product_id,
  coalesce(size, 'std'),
  coalesce(sleeve_option, 'any')
)
where custom_measurements is null and selected_piece_ids is null;

-- ── order_items: snapshot of the pieces that were bought ────────────────
-- Human-readable ("Top + Bottom + Dupatta"), alongside the already-
-- snapshotted unit_price (which is the server-computed sum). Same snapshot
-- convention as product_name / selected_size.
alter table public.order_items add column selected_pieces text;
