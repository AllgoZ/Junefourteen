/**
 * Real dummy photography (client-supplied) used until actual product/campaign
 * photography is available. Referenced by slug-hash rotation in
 * `lib/mock-data/products.ts` and directly by hero/collections/editorial
 * sections — swap these paths for real assets later with no component changes.
 */
export const GALLERY_IMAGES = [
  "/images/model-cream-anarkali-blue-wall.webp",
  "/images/model-mustard-kurta-kalamkari-dupatta.webp",
  "/images/model-half-saree-mustard-purple.webp",
  "/images/model-maroon-anarkali-printed-dupatta.webp",
  "/images/model-purple-kurta-red-door.webp",
  "/images/models-duo-red-maroon-sets.webp",
] as const;
