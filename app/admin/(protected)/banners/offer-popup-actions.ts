"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadImage, deleteImage } from "@/lib/cloudinary/admin";
import { validateImageFile } from "@/lib/cloudinary/validate-image";
import {
  getOfferPopupForAdmin,
  updateOfferPopupForAdmin,
  type OfferPopupInput,
} from "@/lib/repositories/admin/offer-popup";

export interface OfferPopupFormState {
  error?: string;
  success?: boolean;
}

const MIN_WIDTH = 240;
const MAX_WIDTH = 900;
const DEFAULT_WIDTH = 420;

export async function saveOfferPopupAction(
  _prevState: OfferPopupFormState,
  formData: FormData
): Promise<OfferPopupFormState> {
  await requireAdmin();
  const admin = createAdminClient();

  const existing = await getOfferPopupForAdmin(admin);

  let imageUrl = existing.image_url;
  let cloudinaryPublicId = existing.cloudinary_public_id;
  let imageWidth = existing.image_width;
  let imageHeight = existing.image_height;

  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const validation = validateImageFile(file, buffer);
    if (!validation.valid) return { error: validation.error };
    const uploaded = await uploadImage(buffer, "offer-popup");
    if (cloudinaryPublicId) await deleteImage(cloudinaryPublicId).catch(() => {});
    imageUrl = uploaded.url;
    cloudinaryPublicId = uploaded.publicId;
    imageWidth = uploaded.width;
    imageHeight = uploaded.height;
  } else if (formData.get("removeImage") === "on") {
    if (cloudinaryPublicId) await deleteImage(cloudinaryPublicId).catch(() => {});
    imageUrl = null;
    cloudinaryPublicId = null;
    imageWidth = null;
    imageHeight = null;
  }

  const linkHref = String(formData.get("linkHref") ?? "").trim() || null;
  const widthRaw = Number(formData.get("displayWidthPx"));
  const displayWidthPx = Number.isFinite(widthRaw)
    ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(widthRaw)))
    : DEFAULT_WIDTH;

  const input: OfferPopupInput = {
    imageUrl,
    cloudinaryPublicId,
    imageAlt: String(formData.get("imageAlt") ?? "").trim(),
    imageWidth,
    imageHeight,
    linkHref,
    displayWidthPx,
    isActive: formData.get("isActive") === "on",
  };

  try {
    await updateOfferPopupForAdmin(admin, input);
    revalidateTag("offer-popup", "max");
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Could not save the offer popup. Please try again." };
  }
}
