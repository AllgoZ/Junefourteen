import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type AdminAboutPageContentRow = Database["public"]["Tables"]["about_page_content"]["Row"];

export async function getAboutPageContentForAdmin(
  admin: SupabaseClient<Database>
): Promise<AdminAboutPageContentRow> {
  const { data, error } = await admin.from("about_page_content").select("*").eq("id", true).single();
  if (error || !data) throw new Error(`getAboutPageContentForAdmin: ${error?.message}`);
  return data;
}

export interface AboutPageContentInput {
  heroImageUrl: string;
  heroCloudinaryPublicId: string | null;
  heroImageAlt: string;
  heading: string;
  introBody: string;
  storyEyebrow: string;
  storyTitle: string;
  storyBody: string;
  storyImageUrl: string;
  storyCloudinaryPublicId: string | null;
  storyImageAlt: string;
  philosophyEyebrow: string;
  philosophyTitle: string;
  philosophyBody: string;
  philosophyImageUrl: string;
  philosophyCloudinaryPublicId: string | null;
  philosophyImageAlt: string;
  journalEyebrow: string;
  journalTitle: string;
  journalBody: string;
}

export async function upsertAboutPageContentForAdmin(
  admin: SupabaseClient<Database>,
  input: AboutPageContentInput
): Promise<void> {
  const { error } = await admin
    .from("about_page_content")
    .update({
      hero_image_url: input.heroImageUrl,
      hero_cloudinary_public_id: input.heroCloudinaryPublicId,
      hero_image_alt: input.heroImageAlt,
      heading: input.heading,
      intro_body: input.introBody,
      story_eyebrow: input.storyEyebrow,
      story_title: input.storyTitle,
      story_body: input.storyBody,
      story_image_url: input.storyImageUrl,
      story_cloudinary_public_id: input.storyCloudinaryPublicId,
      story_image_alt: input.storyImageAlt,
      philosophy_eyebrow: input.philosophyEyebrow,
      philosophy_title: input.philosophyTitle,
      philosophy_body: input.philosophyBody,
      philosophy_image_url: input.philosophyImageUrl,
      philosophy_cloudinary_public_id: input.philosophyCloudinaryPublicId,
      philosophy_image_alt: input.philosophyImageAlt,
      journal_eyebrow: input.journalEyebrow,
      journal_title: input.journalTitle,
      journal_body: input.journalBody,
    })
    .eq("id", true);
  if (error) throw new Error(`upsertAboutPageContentForAdmin: ${error.message}`);
}
