import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CampaignBanner {
  imageUrl: string;
  imageAlt: string;
  tone: number;
  linkLabel: string;
  linkHref: string;
}

async function fetchCampaignBanner(): Promise<CampaignBanner | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("homepage_campaign")
    .select("image_url, image_alt, tone, link_label, link_href")
    .eq("id", true)
    .single();
  if (error || !data) return null;
  return {
    imageUrl: data.image_url,
    imageAlt: data.image_alt,
    tone: data.tone,
    linkLabel: data.link_label,
    linkHref: data.link_href,
  };
}

/** null falls back to the original hardcoded banner — the homepage never breaks. */
export const getCampaignBanner = unstable_cache(fetchCampaignBanner, ["homepage-campaign"], {
  tags: ["homepage-campaign"],
  revalidate: 3600,
});

export interface GalleryImage {
  imageUrl: string;
  imageAlt: string;
  tone: number;
}

async function fetchGalleryImages(): Promise<GalleryImage[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("homepage_gallery_images")
    .select("image_url, image_alt, tone")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data.map((row) => ({ imageUrl: row.image_url, imageAlt: row.image_alt, tone: row.tone }));
}

/** Empty array falls back to the original hardcoded gallery tiles. */
export const getGalleryImages = unstable_cache(fetchGalleryImages, ["homepage-gallery-images"], {
  tags: ["homepage-gallery-images"],
  revalidate: 3600,
});
