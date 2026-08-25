-- Razorpay payment references. Both nullable — set once payment is
-- initiated/verified (see app/(site)/checkout/actions.ts). Every existing
-- order keeps working unchanged.
alter table public.orders
  add column razorpay_order_id text,
  add column razorpay_payment_id text;
