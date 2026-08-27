"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getAboutPageContentForAdmin,
  upsertAboutPageContentForAdmin,
  type AboutPageContentInput,
} from "@/lib/repositories/admin/about";
import { uploadImage, deleteImage } from "@/lib/cloudinary/admin";
import { validateImageFile } from "@/lib/cloudinary/validate-image";

export interface AboutPageFormState {
  error?: string;
  success?: boolean;
}

/** Resolves one image field: an uploaded file (validated) wins and replaces the prior Cloudinary asset, otherwise the existing value is kept. */
async function resolveImage(
  formData: FormData,
  fileField: string,
  current: { url: string; publicId: string | null }
): Promise<{ url: string; publicId: string | null }> {
  const file = formData.get(fileField);
  if (!(file instanceof File) || file.size === 0) return current;

  const buffer = Buffer.from(await file.arrayBuffer());
  const validation = validateImageFile(file, buffer);
  if (!validation.valid) throw new Error(validation.error);

  const uploaded = await uploadImage(buffer, "about");
  if (current.publicId) await deleteImage(current.publicId).catch(() => {});
  return { url: uploaded.url, publicId: uploaded.publicId };
}

function text(formData: FormData, field: string, fallback: string): string {
  const value = String(formData.get(field) ?? "").trim();
  return value || fallback;
}

export async function saveAboutPageContentAction(
  _prevState: AboutPageFormState,
  formData: FormData
): Promise<AboutPageFormState> {
  await requireAdmin();
  const admin = createAdminClient();
  const existing = await getAboutPageContentForAdmin(admin);

  let hero: { url: string; publicId: string | null };
  let story: { url: string; publicId: string | null };
  let philosophy: { url: string; publicId: string | null };
  try {
    hero = await resolveImage(formData, "heroImage", {
      url: existing.hero_image_url,
      publicId: existing.hero_cloudinary_public_id,
    });
    story = await resolveImage(formData, "storyImage", {
      url: existing.story_image_url,
      publicId: existing.story_cloudinary_public_id,
    });
    philosophy = await resolveImage(formData, "philosophyImage", {
      url: existing.philosophy_image_url,
      publicId: existing.philosophy_cloudinary_public_id,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not upload one of the images." };
  }

  const input: AboutPageContentInput = {
    heroImageUrl: hero.url,
    heroCloudinaryPublicId: hero.publicId,
    heroImageAlt: text(formData, "heroImageAlt", existing.hero_image_alt),
    heading: text(formData, "heading", existing.heading),
    introBody: text(formData, "introBody", existing.intro_body),
    storyEyebrow: text(formData, "storyEyebrow", existing.story_eyebrow),
    storyTitle: text(formData, "storyTitle", existing.story_title),
    storyBody: text(formData, "storyBody", existing.story_body),
    storyImageUrl: story.url,
    storyCloudinaryPublicId: story.publicId,
    storyImageAlt: text(formData, "storyImageAlt", existing.story_image_alt),
    philosophyEyebrow: text(formData, "philosophyEyebrow", existing.philosophy_eyebrow),
    philosophyTitle: text(formData, "philosophyTitle", existing.philosophy_title),
    philosophyBody: text(formData, "philosophyBody", existing.philosophy_body),
    philosophyImageUrl: philosophy.url,
    philosophyCloudinaryPublicId: philosophy.publicId,
    philosophyImageAlt: text(formData, "philosophyImageAlt", existing.philosophy_image_alt),
    journalEyebrow: text(formData, "journalEyebrow", existing.journal_eyebrow),
    journalTitle: text(formData, "journalTitle", existing.journal_title),
    journalBody: text(formData, "journalBody", existing.journal_body),
  };

  try {
    await upsertAboutPageContentForAdmin(admin, input);
    revalidateTag("about-page", "max");
    revalidatePath("/admin/about");
    revalidatePath("/about");
    return { success: true };
  } catch {
    return { error: "Could not save the About page. Please try again." };
  }
}
