import type { BannerRow } from "@/lib/repositories/banners";
import type { Banner } from "@/types/product";

export function dbBannerToBanner(row: BannerRow): Banner {
  return {
    id: row.id,
    alt: row.desktop_image_alt,
    src: row.desktop_image_url ?? undefined,
    objectPosition: row.desktop_object_position,
    mobileSrc: row.mobile_image_url ?? undefined,
    mobileAlt: row.mobile_image_alt || row.desktop_image_alt,
    mobileObjectPosition: row.mobile_object_position,
    tone: row.tone,
    // Text is optional even when a URL is set — default it to "Shop Now"
    // rather than silently dropping the admin's link entirely.
    link: row.primary_cta_href ? { href: row.primary_cta_href, label: row.primary_cta_text || "Shop Now" } : undefined,
  };
}
