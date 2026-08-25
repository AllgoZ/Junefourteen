import { createAnonClient } from "@/lib/supabase/anon";

export interface BannerRow {
  id: string;
  desktop_image_url: string;
  desktop_image_alt: string;
  desktop_object_position: string;
  mobile_image_url: string | null;
  mobile_image_alt: string;
  mobile_object_position: string;
  tone: number;
  primary_cta_href: string | null;
  primary_cta_text: string | null;
}

const BANNER_SELECT = `id, desktop_image_url, desktop_image_alt, desktop_object_position,
  mobile_image_url, mobile_image_alt, mobile_object_position, tone,
  primary_cta_href, primary_cta_text`;

export async function listActiveBanners(): Promise<BannerRow[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("banners")
    .select(BANNER_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .overrideTypes<BannerRow[], { merge: false }>();

  if (error) throw new Error(`listActiveBanners: ${error.message}`);
  return data;
}
