"use client";

/**
 * Custom next/image loader for Cloudinary URLs. Lets Cloudinary do all the
 * resizing/format/DPR work (f_auto,q_auto,dpr_auto,w_<width>) instead of
 * stacking Next's own image optimizer on top of it — see the "don't double-
 * optimize" note in the backend brief (§11/§12).
 *
 * Next requires a custom App Router loaderFile to be a Client Component
 * (it's serialized to the client) — see next.config.ts's `images.loaderFile`.
 * It doesn't touch any secret, only the public cloud name baked into the
 * stored image URL, which is safe client-side.
 */
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Non-Cloudinary sources (e.g. local /images/*.jpg fallbacks during
  // migration) pass through untouched — next/image still handles them.
  if (!src.includes("res.cloudinary.com")) return src;

  const params = [`f_auto`, `q_${quality ?? "auto"}`, `dpr_auto`, `w_${width}`].join(",");

  return src.replace("/upload/", `/upload/${params}/`);
}
