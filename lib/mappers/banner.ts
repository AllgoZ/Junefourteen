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
    badgeText: row.badge_text ?? undefined,
    headline: row.headline || undefined,
    subheading: row.subheading ?? undefined,
    offerBadgeText: row.offer_badge_text ?? undefined,
    link:
      row.primary_cta_href && row.primary_cta_text
        ? { label: row.primary_cta_text, href: row.primary_cta_href }
        : undefined,
    secondaryLink:
      row.secondary_cta_href && row.secondary_cta_text
        ? { label: row.secondary_cta_text, href: row.secondary_cta_href }
        : undefined,
  };
}
