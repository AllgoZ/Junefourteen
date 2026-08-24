-- updated_at maintenance ----------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.collections
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.product_images
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.addresses
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.carts
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.cart_items
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- profiles auto-provisioning -------------------------------------------------
-- Fires when Supabase Auth creates a new auth.users row (sign-up). security
-- definer so it can insert into public.profiles regardless of the caller's
-- RLS grants — the caller here is Supabase Auth's own internal role, not a
-- normal authenticated user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- profiles.role privilege-escalation guard -----------------------------------
-- Ordinary authenticated users can update their own profile row (see RLS in
-- 0003_rls.sql), but must never be able to grant themselves 'admin'. Role
-- changes only happen through supabase/scripts/promote-admin.ts, which uses
-- the service-role client — the one caller this trigger lets through.
create or replace function public.guard_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.role() <> 'service_role' then
    raise exception 'role cannot be changed directly';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role_change
  before update on public.profiles
  for each row execute function public.guard_profile_role_change();
