-- Links order_requests to the submitting customer when signed in (nullable
-- — guest submission is still fully supported, same convention as
-- orders.user_id) so a customer can see their own pre-order requests on
-- /account, and so the PDP can tell "you already requested this" apart
-- from "you haven't yet" on a fresh page load, not just for the current
-- browser session.

alter table public.order_requests
  add column user_id uuid references auth.users (id) on delete set null;

create index order_requests_user_id_idx on public.order_requests (user_id);

-- The only client-readable policy on this table — everything else (the
-- public submit path, the admin list) already goes through the
-- service-role client and doesn't need one.
create policy "order_requests_owner_select" on public.order_requests
  for select using (auth.uid() = user_id);
