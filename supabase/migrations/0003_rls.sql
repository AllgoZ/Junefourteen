-- Row Level Security. Per the implementation plan's Phase 2 decision: admin
-- writes (products/collections/images/orders status) go exclusively through
-- server actions using the service-role client (lib/supabase/admin.ts) after
-- a requireAdmin() check — that client has BYPASSRLS, so there are no
-- separate "admin can write" policies below by design. Every write policy
-- that does exist is scoped to a row's own owner.

alter table public.profiles enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_collections enable row level security;
alter table public.product_images enable row level security;
alter table public.product_sizes enable row level security;
alter table public.product_sleeve_options enable row level security;
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- profiles: a user can only see/update their own row (role changes blocked
-- by the guard_profile_role_change trigger regardless of this policy).
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- collections / products: public catalog read, active rows only.
create policy "collections_public_read" on public.collections
  for select using (is_active = true);
create policy "products_public_read" on public.products
  for select using (is_active = true);

-- product_collections / product_images / product_sizes / product_sleeve_options:
-- readable when the parent product is active.
create policy "product_collections_public_read" on public.product_collections
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.is_active = true)
  );
create policy "product_images_public_read" on public.product_images
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.is_active = true)
  );
create policy "product_sizes_public_read" on public.product_sizes
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.is_active = true)
  );
create policy "product_sleeve_options_public_read" on public.product_sleeve_options
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.is_active = true)
  );

-- addresses: fully owned by the customer.
create policy "addresses_owner_all" on public.addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- carts: fully owned by the customer.
create policy "carts_owner_all" on public.carts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- cart_items: owned via the parent cart.
create policy "cart_items_owner_all" on public.cart_items
  for all using (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  );

-- wishlist_items: fully owned by the customer.
create policy "wishlist_items_owner_all" on public.wishlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- orders / order_items: customers can READ their own orders only. There is
-- deliberately no insert/update/delete policy here — order creation always
-- goes through app/checkout/actions.ts's createOrder (service-role client,
-- server-computed pricing) and status updates always go through admin
-- server actions, never a direct client write. See brief §21/§23.
create policy "orders_owner_select" on public.orders
  for select using (auth.uid() = user_id);
create policy "order_items_owner_select" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );
