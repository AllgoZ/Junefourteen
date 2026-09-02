-- Per-product size-chart image. When set, the storefront's "Size Guide"
-- popup (components/product/size-guide-modal.tsx) shows this image *instead
-- of* the generic hardcoded table (size-guide-content.tsx) for that product.
-- Products with these columns null keep the generic table + measuring tips
-- exactly as before. The standalone /size-guide page is unaffected — it's
-- the brand-wide generic guide, not product-specific.
--
-- Same single-image shape as collections.image_url/cloudinary_public_id/
-- image_alt. All nullable; no backfill, and supabase/seed/seed.ts upserts a
-- fixed column list so it is unaffected.
alter table public.products
  add column size_chart_image_url text,
  add column size_chart_cloudinary_public_id text,
  add column size_chart_image_alt text;
