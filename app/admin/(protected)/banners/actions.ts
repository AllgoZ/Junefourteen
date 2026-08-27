"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createBannerForAdmin,
  updateBannerForAdmin,
  getBannerForAdmin,
  listAllBannersForAdmin,
  setBannerActive,
  deleteBannerForAdmin,
  type BannerFormInput,
} from "@/lib/repositories/admin/banners";
import { uploadImage, deleteImage } from "@/lib/cloudinary/admin";
import { validateImageFile } from "@/lib/cloudinary/validate-image";

export interface BannerFormState {
  error?: string;
  bannerId?: string;
}

/** Placeholder-gradient seed (see collections.tone) — banners always require an image, so this never actually renders; kept off the form and just defaulted here. */
const DEFAULT_TONE = 0.5;

function readPosition(formData: FormData, field: string): string {
  return String(formData.get(field) ?? "50% 50%").trim() || "50% 50%";
}

function orNull(formData: FormData, field: string): string | null {
  const value = String(formData.get(field) ?? "").trim();
  return value || null;
}

/** Thrown by resolveImage on a failed upload validation — caught in saveBannerAction to surface the specific message instead of a generic save error. */
class ImageValidationError extends Error {}

/**
 * Resolves one image slot from a save: an uploaded file wins (goes to
 * Cloudinary, replacing any prior Cloudinary asset), otherwise a manually
 * pasted URL wins (stored as-is, cloudinaryPublicId null since it isn't a
 * Cloudinary-managed asset — never passed to deleteImage later), otherwise
 * the existing value is kept unchanged.
 */
async function resolveImage(
  formData: FormData,
  fileField: string,
  urlField: string,
  folder: string,
  current: { url: string | null; publicId: string | null }
): Promise<{ url: string | null; publicId: string | null }> {
  const file = formData.get(fileField);
  if (file instanceof File && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const validation = validateImageFile(file, buffer);
    if (!validation.valid) throw new ImageValidationError(validation.error);
    const uploaded = await uploadImage(buffer, folder);
    if (current.publicId) await deleteImage(current.publicId).catch(() => {});
    return { url: uploaded.url, publicId: uploaded.publicId };
  }

  const pastedUrl = String(formData.get(urlField) ?? "").trim();
  if (pastedUrl) {
    if (current.publicId) await deleteImage(current.publicId).catch(() => {});
    return { url: pastedUrl, publicId: null };
  }

  return current;
}

export async function saveBannerAction(
  _prevState: BannerFormState,
  formData: FormData
): Promise<BannerFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const desktopObjectPosition = readPosition(formData, "desktopObjectPosition");
  const mobileObjectPosition = readPosition(formData, "mobileObjectPosition");

  const admin = createAdminClient();

  let desktop = { url: null as string | null, publicId: null as string | null };
  let mobile = { url: null as string | null, publicId: null as string | null };
  if (id) {
    const existing = await getBannerForAdmin(admin, id);
    desktop = { url: existing?.desktop_image_url ?? null, publicId: existing?.desktop_cloudinary_public_id ?? null };
    mobile = { url: existing?.mobile_image_url ?? null, publicId: existing?.mobile_cloudinary_public_id ?? null };
  }

  try {
    desktop = await resolveImage(formData, "desktopImage", "desktopImageUrlInput", "banners/desktop", desktop);

    if (formData.get("removeMobileImage") === "on" && !(formData.get("mobileImage") instanceof File && (formData.get("mobileImage") as File).size > 0)) {
      if (mobile.publicId) await deleteImage(mobile.publicId).catch(() => {});
      mobile = { url: null, publicId: null };
    } else {
      mobile = await resolveImage(formData, "mobileImage", "mobileImageUrlInput", "banners/mobile", mobile);
    }
  } catch (err) {
    if (err instanceof ImageValidationError) return { error: err.message };
    throw err;
  }

  if (!desktop.url) {
    return { error: "A banner needs a laptop image." };
  }

  const input: BannerFormInput = {
    desktopImageUrl: desktop.url,
    desktopImageAlt: String(formData.get("desktopImageAlt") ?? ""),
    desktopCloudinaryPublicId: desktop.publicId,
    desktopObjectPosition,
    mobileImageUrl: mobile.url,
    mobileImageAlt: String(formData.get("mobileImageAlt") ?? ""),
    mobileCloudinaryPublicId: mobile.publicId,
    mobileObjectPosition,
    tone: DEFAULT_TONE,
    badgeText: null,
    headline: "",
    subheading: null,
    primaryCtaText: orNull(formData, "primaryCtaText"),
    primaryCtaHref: orNull(formData, "primaryCtaHref"),
    secondaryCtaText: null,
    secondaryCtaHref: null,
    offerBadgeText: null,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
    isActive: formData.get("isActive") === "on",
  };

  try {
    const bannerId = id ? (await updateBannerForAdmin(admin, id, input), id) : await createBannerForAdmin(admin, input);

    revalidateTag("banners", "max");
    revalidatePath("/admin/banners");

    return { bannerId };
  } catch {
    return { error: "Could not save this banner. Please check the fields and try again." };
  }
}

export interface BulkBannerFormState {
  error?: string;
  createdCount?: number;
  unusedMobileCount?: number;
}

/**
 * Add several banners in one go from two independent multi-file pickers —
 * "Laptop Images" and "Mobile Images" are never merged into one input, so
 * an admin can tell exactly which files go to which slot. They're paired up
 * by position (1st laptop image with the 1st mobile image, and so on); a
 * laptop image with no matching mobile image just falls back like normal.
 * Laptop is the anchor (schema requires it per banner), so any extra mobile
 * images past the laptop count have nothing to pair with and are skipped —
 * surfaced back to the admin rather than silently dropped.
 * Uploaded and inserted one at a time (not Promise.all) so sort_order stays
 * simple/deterministic and Cloudinary/Supabase aren't hit with a burst of
 * concurrent requests. No headline/copy is set on these — edit any of them
 * afterward to add overlay text, a link, or fine-tune the crop.
 */
export async function bulkCreateBannersAction(
  _prevState: BulkBannerFormState,
  formData: FormData
): Promise<BulkBannerFormState> {
  await requireAdmin();

  const desktopFiles = formData.getAll("desktopImages").filter((f): f is File => f instanceof File && f.size > 0);
  const mobileFiles = formData.getAll("mobileImages").filter((f): f is File => f instanceof File && f.size > 0);

  if (desktopFiles.length === 0) {
    return { error: "Choose at least one laptop image." };
  }

  const admin = createAdminClient();
  const existing = await listAllBannersForAdmin(admin);
  let nextSortOrder = existing.reduce((max, b) => Math.max(max, b.sort_order), -1) + 1;

  try {
    for (let i = 0; i < desktopFiles.length; i++) {
      const desktopBuffer = Buffer.from(await desktopFiles[i].arrayBuffer());
      const desktopValidation = validateImageFile(desktopFiles[i], desktopBuffer);
      if (!desktopValidation.valid) throw new ImageValidationError(desktopValidation.error);
      const desktopUploaded = await uploadImage(desktopBuffer, "banners/desktop");

      let mobileImageUrl: string | null = null;
      let mobileCloudinaryPublicId: string | null = null;
      const mobileFile = mobileFiles[i];
      if (mobileFile) {
        const mobileBuffer = Buffer.from(await mobileFile.arrayBuffer());
        const mobileValidation = validateImageFile(mobileFile, mobileBuffer);
        if (!mobileValidation.valid) throw new ImageValidationError(mobileValidation.error);
        const mobileUploaded = await uploadImage(mobileBuffer, "banners/mobile");
        mobileImageUrl = mobileUploaded.url;
        mobileCloudinaryPublicId = mobileUploaded.publicId;
      }

      await createBannerForAdmin(admin, {
        desktopImageUrl: desktopUploaded.url,
        desktopImageAlt: "",
        desktopCloudinaryPublicId: desktopUploaded.publicId,
        desktopObjectPosition: "50% 50%",
        mobileImageUrl,
        mobileImageAlt: "",
        mobileCloudinaryPublicId,
        mobileObjectPosition: "50% 50%",
        tone: DEFAULT_TONE,
        badgeText: null,
        headline: "",
        subheading: null,
        primaryCtaText: null,
        primaryCtaHref: null,
        secondaryCtaText: null,
        secondaryCtaHref: null,
        offerBadgeText: null,
        sortOrder: nextSortOrder++,
        isActive: true,
      });
    }

    revalidateTag("banners", "max");
    revalidatePath("/admin/banners");

    const unusedMobileCount = mobileFiles.length - desktopFiles.length;
    return {
      createdCount: desktopFiles.length,
      unusedMobileCount: unusedMobileCount > 0 ? unusedMobileCount : undefined,
    };
  } catch (err) {
    if (err instanceof ImageValidationError) return { error: err.message };
    return {
      error: "Something went wrong partway through. Check the list below — any banners already created can be edited or removed individually.",
    };
  }
}

export async function setBannerActiveAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("isActive") === "true";
  if (!id) return;

  const admin = createAdminClient();
  await setBannerActive(admin, id, isActive);
  revalidateTag("banners", "max");
  revalidatePath("/admin/banners");
}

/**
 * A real delete, not a deactivate — see deleteBannerForAdmin for why that's
 * safe for banners specifically. Cleans up both Cloudinary assets (if any;
 * a pasted-URL image has no publicId and is left untouched, since it was
 * never ours to manage).
 */
export async function deleteBannerAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const admin = createAdminClient();
  const existing = await getBannerForAdmin(admin, id);
  await deleteBannerForAdmin(admin, id);

  if (existing?.desktop_cloudinary_public_id) await deleteImage(existing.desktop_cloudinary_public_id).catch(() => {});
  if (existing?.mobile_cloudinary_public_id) await deleteImage(existing.mobile_cloudinary_public_id).catch(() => {});

  revalidateTag("banners", "max");
  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}
