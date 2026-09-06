import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export interface OfferPopup {
  imageUrl: string;
  imageAlt: string;
  imageWidth: number | null;
  imageHeight: number | null;
  /** Where clicking the image goes. null = clicking just closes the popup. */
  linkHref: string | null;
  /** Admin-set popup width in px; the component caps it to the viewport. */
  displayWidthPx: number;
}

async function fetchOfferPopup(): Promise<OfferPopup | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("offer_popup")
    .select("image_url, image_alt, image_width, image_height, link_href, display_width_px, is_active")
    .eq("id", true)
    .single();

  if (error || !data || !data.is_active || !data.image_url) return null;

  return {
    imageUrl: data.image_url,
    imageAlt: data.image_alt,
    imageWidth: data.image_width,
    imageHeight: data.image_height,
    linkHref: data.link_href,
    displayWidthPx: data.display_width_px,
  };
}

/**
 * null when the admin hasn't set up + activated an offer — the homepage's
 * <OfferPopup> then renders nothing. Same service-role-read-inside-cache
 * shape as lib/services/homepage.ts#getCampaignBanner.
 */
export const getOfferPopup = unstable_cache(fetchOfferPopup, ["offer-popup"], {
  tags: ["offer-popup"],
  revalidate: 3600,
});
