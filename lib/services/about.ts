import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AboutPageContent {
  heroImageUrl: string;
  heroImageAlt: string;
  heading: string;
  introBody: string;
  storyEyebrow: string;
  storyTitle: string;
  storyBody: string;
  storyImageUrl: string;
  storyImageAlt: string;
  philosophyEyebrow: string;
  philosophyTitle: string;
  philosophyBody: string;
  philosophyImageUrl: string;
  philosophyImageAlt: string;
  journalEyebrow: string;
  journalTitle: string;
  journalBody: string;
}

async function fetchAboutPageContent(): Promise<AboutPageContent | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("about_page_content").select("*").eq("id", true).single();
  if (error || !data) return null;

  return {
    heroImageUrl: data.hero_image_url,
    heroImageAlt: data.hero_image_alt,
    heading: data.heading,
    introBody: data.intro_body,
    storyEyebrow: data.story_eyebrow,
    storyTitle: data.story_title,
    storyBody: data.story_body,
    storyImageUrl: data.story_image_url,
    storyImageAlt: data.story_image_alt,
    philosophyEyebrow: data.philosophy_eyebrow,
    philosophyTitle: data.philosophy_title,
    philosophyBody: data.philosophy_body,
    philosophyImageUrl: data.philosophy_image_url,
    philosophyImageAlt: data.philosophy_image_alt,
    journalEyebrow: data.journal_eyebrow,
    journalTitle: data.journal_title,
    journalBody: data.journal_body,
  };
}

/** null falls back to the page's original hardcoded copy — /about never breaks. */
export const getAboutPageContent = unstable_cache(fetchAboutPageContent, ["about-page"], {
  tags: ["about-page"],
  revalidate: 3600,
});
