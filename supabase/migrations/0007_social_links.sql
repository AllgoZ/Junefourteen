-- Footer/social-media links, admin-managed (previously the hardcoded
-- site.social array in lib/config/site.ts). Same shape/conventions as
-- banners/collections. label/href stay free-text (not an enum) so the
-- admin can add any platform, not just Instagram/Pinterest/Facebook —
-- components/layout/site-footer.tsx's existing SOCIAL_MONOGRAMS map already
-- falls back to the label's first letter for anything it doesn't recognize.
create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.social_links
  for each row execute function public.set_updated_at();

alter table public.social_links enable row level security;

create policy "social_links_public_read" on public.social_links
  for select using (is_active = true);
