-- Backs the "Request to Order" pre-order lead-capture flow that replaces
-- the disabled Sold Out button on the PDP (components/product/add-to-bag-
-- panel.tsx). This is a lead, not a priced/paid transaction, so it's a
-- dedicated table rather than reusing orders/order_items — no payment or
-- authoritative pricing is involved. product_name/product_slug are
-- snapshotted directly on the row (same convention as order_items) so a
-- request survives a later product deletion; product_id is `set null`,
-- not cascade, for the same reason.

create table public.order_requests (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_slug text not null,
  customer_name text not null,
  phone text not null,
  email text,
  size text not null,
  quantity integer not null check (quantity > 0),
  delivery_address text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'fulfilled', 'cancelled')),
  created_at timestamptz not null default now()
);

create index order_requests_status_idx on public.order_requests (status);
create index order_requests_created_at_idx on public.order_requests (created_at);

-- No policies: the public submit path goes through a Server Action using
-- the service-role client (app/(site)/product/actions.ts), never a direct
-- client insert — same convention as orders/rate_limit_hits.
alter table public.order_requests enable row level security;
