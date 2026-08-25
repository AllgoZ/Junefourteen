import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type AdminHomepageCampaignRow = Database["public"]["Tables"]["homepage_campaign"]["Row"];
export type AdminHomepageGalleryImageRow = Database["public"]["Tables"]["homepage_gallery_images"]["Row"];

export async function getHomepageCampaignForAdmin(admin: SupabaseClient<Database>): Promise<AdminHomepageCampaignRow> {
  const { data, error } = await admin.from("homepage_campaign").select("*").eq("id", true).single();
  if (error || !data) throw new Error(`getHomepageCampaignForAdmin: ${error?.message}`);
  return data;
}

export interface HomepageCampaignInput {
  imageUrl: string;
  cloudinaryPublicId: string | null;
  imageAlt: string;
  linkLabel: string;
  linkHref: string;
}

export async function upsertHomepageCampaignForAdmin(
  admin: SupabaseClient<Database>,
  input: HomepageCampaignInput
): Promise<void> {
  const { error } = await admin
    .from("homepage_campaign")
    .update({
      image_url: input.imageUrl,
      cloudinary_public_id: input.cloudinaryPublicId,
      image_alt: input.imageAlt,
      link_label: input.linkLabel,
      link_href: input.linkHref,
    })
    .eq("id", true);
  if (error) throw new Error(`upsertHomepageCampaignForAdmin: ${error.message}`);
}

export async function listHomepageGalleryImagesForAdmin(
  admin: SupabaseClient<Database>
): Promise<AdminHomepageGalleryImageRow[]> {
  const { data, error } = await admin
    .from("homepage_gallery_images")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`listHomepageGalleryImagesForAdmin: ${error.message}`);
  return data;
}

export interface HomepageGalleryImageUpdate {
  id: string;
  imageUrl: string;
  cloudinaryPublicId: string | null;
  imageAlt: string;
}

export async function updateHomepageGalleryImage(
  admin: SupabaseClient<Database>,
  input: HomepageGalleryImageUpdate
): Promise<void> {
  const { error } = await admin
    .from("homepage_gallery_images")
    .update({
      image_url: input.imageUrl,
      cloudinary_public_id: input.cloudinaryPublicId,
      image_alt: input.imageAlt,
    })
    .eq("id", input.id);
  if (error) throw new Error(`updateHomepageGalleryImage: ${error.message}`);
}
