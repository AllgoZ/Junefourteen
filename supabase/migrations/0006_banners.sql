-- Homepage hero-carousel banners, admin-managed (previously a hardcoded
-- array in components/home/hero-section.tsx). Same shape/conventions as
-- collections: single Cloudinary image, tone for the placeholder fallback,
-- is_active for soft-delete, sort_order for display order. object_position
-- is stored per-banner (CSS object-position string) since the hero crops
-- differently on mobile vs. desktop and each photo needs its own tuned
-- focal point — see components/admin/banner-preview.tsx.
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  image_alt text not null default '',
  cloudinary_public_id text,
  object_position text not null default '50% 50%',
  tone numeric not null default 0.5,
  link_href text,
  link_label text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index banners_is_active_idx on public.banners (is_active);

create trigger set_updated_at before update on public.banners
  for each row execute function public.set_updated_at();

alter table public.banners enable row level security;

create policy "banners_public_read" on public.banners
  for select using (is_active = true);
