-- Banners gain optional overlay copy (badge/headline/subheading) and a
-- second CTA/offer badge, matching a richer admin editor reference the user
-- provided. Renaming link_href/link_label to primary_cta_href/primary_cta_text
-- for symmetry with the new secondary_cta_* pair. headline is required in
-- the admin UI but stored as `not null default ''` (this project's existing
-- convention for required text columns, e.g. products.description) rather
-- than a DB-level NOT NULL without a default — validated server-side in
-- saveBannerAction instead. All overlay fields are opt-in: hero-section.tsx
-- only renders the text block when headline is non-empty, so every banner
-- created before this migration keeps today's exact text-free look.
alter table public.banners rename column link_href to primary_cta_href;
alter table public.banners rename column link_label to primary_cta_text;

alter table public.banners
  add column badge_text text,
  add column headline text not null default '',
  add column subheading text,
  add column secondary_cta_text text,
  add column secondary_cta_href text,
  add column offer_badge_text text;
