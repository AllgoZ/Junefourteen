-- Per-product stock tracking. The schema has no per-variant SKUs today
-- (product_sizes/product_sleeve_options are plain availability lists, not
-- separately-stocked rows), so this is per-product stock, matching that
-- existing granularity — not a full multi-variant inventory system.
-- Deliberately independent of is_sold_out: that flag stays the sole
-- storefront purchase-gate (see checkout/PDP), so adding stock tracking
-- here doesn't change any existing storefront behavior. Admins can still
-- manually mark something sold out regardless of a nonzero stock count.
alter table public.products
  add column stock_quantity integer not null default 0 check (stock_quantity >= 0),
  add column low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0);

create index products_stock_quantity_idx on public.products (stock_quantity);
