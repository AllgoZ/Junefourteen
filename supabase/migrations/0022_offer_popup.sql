-- Homepage promotional popup: one admin-uploaded image, shown once per
-- visitor on first load (dismissal persisted client-side in localStorage,
-- keyed on the image URL so a new offer image re-shows). The image carries
-- everything -- offer copy, terms, CTA -- the popup renders no text of its
-- own. Managed from a card on /admin/banners.
--
-- Singleton row (same boolean-PK trick as tax_settings / homepage_campaign:
-- a PK that can only ever be `true`, so a second insert always collides).
-- Seeded inactive with no image, so the storefront is byte-identical until
-- an admin uploads an image and toggles it on. RLS-enabled with no policies
-- -- read via the service-role client only, same convention as
-- homepage_campaign / shipping_zones.
create table public.offer_popup (
  id boolean primary key default true check (id),
  image_url text,
  cloudinary_public_id text,
  image_alt text not null default '',
  image_width integer,
  image_height integer,
  link_href text,
  display_width_px integer not null default 420 check (display_width_px between 240 and 900),
  is_active boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.offer_popup (id) values (true);

create trigger set_updated_at before update on public.offer_popup
  for each row execute function public.set_updated_at();

alter table public.offer_popup enable row level security;
