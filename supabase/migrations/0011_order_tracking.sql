-- Admin-settable shipment tracking, shown to the customer on their order
-- detail page once set. Both nullable/optional — every existing order
-- keeps working unchanged.
alter table public.orders
  add column tracking_number text,
  add column tracking_url text;
