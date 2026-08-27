-- Two independent, additive pieces — no existing table/column touched:
--
-- 1. An index the new Razorpay webhook handler needs: it only ever receives
--    Razorpay's own order id (never our internal uuid), so it must look up
--    `orders` by `razorpay_order_id`. See app/api/webhooks/razorpay/route.ts.
--
-- 2. A tiny table backing app-level rate limiting (lib/rate-limit.ts) —
--    chosen over an in-memory counter specifically because this app has no
--    single long-lived process to hold one safely, and over adding a new
--    external service (e.g. Redis) since Postgres is already available
--    everywhere via the admin client. Rows are short-lived (see
--    lib/rate-limit.ts's own cleanup) so this never grows large.

create index orders_razorpay_order_id_idx on public.orders (razorpay_order_id);

create table public.rate_limit_hits (
  id bigint generated always as identity primary key,
  key text not null,
  created_at timestamptz not null default now()
);

create index rate_limit_hits_key_created_at_idx on public.rate_limit_hits (key, created_at);

-- Service-role client only (lib/rate-limit.ts) — same default-deny shape as
-- shipping_zones/coupons/tax_settings: RLS enabled, zero policies.
alter table public.rate_limit_hits enable row level security;
