-- Connects the two remaining hardcoded homepage image sections (the
-- full-bleed "Shop Collection" campaign banner and the "Follow Along"
-- Instagram-style 4-photo grid) to the admin CMS. Both are seeded with
-- today's exact hardcoded values so the storefront is pixel-identical
-- immediately after this migration runs. See lib/services/homepage.ts,
-- lib/repositories/admin/homepage.ts, and the new cards on
-- app/admin/(protected)/collections/page.tsx.

-- Singleton row (same trick as tax_settings: a boolean PK that can only
-- ever be `true`, so a second insert always collides).
create table public.homepage_campaign (
  id boolean primary key default true check (id),
  image_url text not null,
  cloudinary_public_id text,
  image_alt text not null default 'JUNEFOURTEEN campaign imagery',
  tone numeric(4, 3) not null default 0.22 check (tone >= 0 and tone <= 1),
  link_label text not null default 'Shop Collection',
  link_href text not null default '/shop',
  updated_at timestamptz not null default now()
);

insert into public.homepage_campaign (id, image_url, image_alt, tone, link_label, link_href) values
  (true, '/images/model-cream-anarkali-blue-wall.webp', 'JUNEFOURTEEN campaign imagery', 0.22, 'Shop Collection', '/shop');

create trigger set_updated_at before update on public.homepage_campaign
  for each row execute function public.set_updated_at();

-- No policies: read via the service-role client only (same convention as
-- shipping_zones/coupons/tax_settings), RLS-enabled-with-no-policies is a
-- default-deny.
alter table public.homepage_campaign enable row level security;

create table public.homepage_gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  cloudinary_public_id text,
  image_alt text not null default '',
  tone numeric(4, 3) not null default 0.4 check (tone >= 0 and tone <= 1),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index homepage_gallery_images_is_active_idx on public.homepage_gallery_images (is_active);

create trigger set_updated_at before update on public.homepage_gallery_images
  for each row execute function public.set_updated_at();

alter table public.homepage_gallery_images enable row level security;

insert into public.homepage_gallery_images (image_url, image_alt, tone, sort_order) values
  ('/images/model-cream-anarkali-blue-wall.webp', 'JUNEFOURTEEN on Instagram', 0.15, 0),
  ('/images/model-mustard-kurta-kalamkari-dupatta.webp', 'JUNEFOURTEEN on Instagram', 0.38, 1),
  ('/images/model-half-saree-mustard-purple.webp', 'JUNEFOURTEEN on Instagram', 0.6, 2),
  ('/images/model-maroon-anarkali-printed-dupatta.webp', 'JUNEFOURTEEN on Instagram', 0.82, 3);
