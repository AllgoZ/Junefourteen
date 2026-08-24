-- Banners originally had one image cropped differently per breakpoint via
-- object_position. That's not enough for source photos whose subject can't
-- be reframed into both a wide laptop crop and a tall mobile crop from the
-- same file (e.g. a full-length campaign shot) — the admin needs to upload
-- a genuinely different image per breakpoint. Renaming the original columns
-- to desktop_* (rather than leaving "image_url" ambiguous) and adding a
-- parallel, optional mobile_* set: mobile_image_url is nullable, and the
-- storefront falls back to the desktop image when it's absent, so every
-- banner created before this migration keeps working unchanged.
alter table public.banners rename column image_url to desktop_image_url;
alter table public.banners rename column image_alt to desktop_image_alt;
alter table public.banners rename column cloudinary_public_id to desktop_cloudinary_public_id;
alter table public.banners rename column object_position to desktop_object_position;

alter table public.banners
  add column mobile_image_url text,
  add column mobile_image_alt text not null default '',
  add column mobile_cloudinary_public_id text,
  add column mobile_object_position text not null default '50% 50%';
