"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createCollectionForAdmin,
  updateCollectionForAdmin,
  getCollectionForAdmin,
  setCollectionActive,
  type CollectionFormInput,
} from "@/lib/repositories/admin/collections";
import { uploadImage, deleteImage } from "@/lib/cloudinary/admin";

export interface CollectionFormState {
  error?: string;
  collectionId?: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function saveCollectionAction(
  _prevState: CollectionFormState,
  formData: FormData
): Promise<CollectionFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const tone = Number(formData.get("tone"));

  if (!name || !Number.isFinite(tone) || tone < 0 || tone > 1) {
    return { error: "Name is required and tone must be a number between 0 and 1." };
  }

  const slug = slugify(slugRaw || name);
  if (!slug) return { error: "Could not derive a valid slug from that name." };

  const admin = createAdminClient();

  let imageUrl: string | null = null;
  let cloudinaryPublicId: string | null = null;
  if (id) {
    const existing = await getCollectionForAdmin(admin, id);
    imageUrl = existing?.image_url ?? null;
    cloudinaryPublicId = existing?.cloudinary_public_id ?? null;
  }

  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadImage(buffer, "collections");
    if (cloudinaryPublicId) await deleteImage(cloudinaryPublicId).catch(() => {});
    imageUrl = uploaded.url;
    cloudinaryPublicId = uploaded.publicId;
  }

  const input: CollectionFormInput = {
    slug,
    name,
    description: String(formData.get("description") ?? ""),
    tone,
    imageUrl,
    imageAlt: String(formData.get("imageAlt") ?? name),
    cloudinaryPublicId,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
    isActive: formData.get("isActive") === "on",
  };

  try {
    const collectionId = id
      ? (await updateCollectionForAdmin(admin, id, input), id)
      : await createCollectionForAdmin(admin, input);

    revalidateTag("collections", "max");
    revalidateTag("products", "max");
    revalidatePath("/admin/collections");

    return { collectionId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save this collection.";
    const friendly = message.includes("collections_slug_key")
      ? "That slug is already in use by another collection."
      : "Could not save this collection. Please check the fields and try again.";
    return { error: friendly };
  }
}

export async function setCollectionActiveAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("isActive") === "true";
  if (!id) return;

  const admin = createAdminClient();
  await setCollectionActive(admin, id, isActive);
  revalidateTag("collections", "max");
  revalidatePath("/admin/collections");
}
