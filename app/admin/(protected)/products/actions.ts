"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createProductForAdmin,
  updateProductForAdmin,
  setProductActive,
  addProductImage,
  deleteProductImageRow,
  reorderProductImages,
  type ProductFormInput,
} from "@/lib/repositories/admin/products";
import { uploadImage, deleteImage } from "@/lib/cloudinary/admin";

export interface ProductFormState {
  error?: string;
  productId?: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
}

function splitCommas(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function saveProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const price = Number(formData.get("price"));
  const category = String(formData.get("category") ?? "").trim();

  if (!name || !category || !Number.isFinite(price) || price < 0) {
    return { error: "Name, category, and a valid price are required." };
  }

  const slug = slugify(slugRaw || name);
  if (!slug) {
    return { error: "Could not derive a valid slug from that name." };
  }

  const compareAtPriceRaw = String(formData.get("compareAtPrice") ?? "").trim();

  const input: ProductFormInput = {
    slug,
    name,
    description: String(formData.get("description") ?? ""),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    price,
    compareAtPrice: compareAtPriceRaw ? Number(compareAtPriceRaw) : null,
    category,
    tags: splitCommas(String(formData.get("tags") ?? "")),
    isNew: formData.get("isNew") === "on",
    isBestSeller: formData.get("isBestSeller") === "on",
    isSoldOut: formData.get("isSoldOut") === "on",
    isActive: formData.get("isActive") === "on",
    customSizeEnabled: formData.get("customSizeEnabled") === "on",
    fabric: String(formData.get("fabric") ?? ""),
    washCare: splitLines(String(formData.get("washCare") ?? "")),
    shippingInfo: String(formData.get("shippingInfo") ?? ""),
    fitNotes: String(formData.get("fitNotes") ?? ""),
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
    stockQuantity: Math.max(0, Number(formData.get("stockQuantity") ?? 0) || 0),
    lowStockThreshold: Math.max(0, Number(formData.get("lowStockThreshold") ?? 5) || 0),
    sizes: formData.getAll("sizes").map(String),
    sleeveOptions: formData.getAll("sleeveOptions").map(String),
    collectionIds: formData.getAll("collectionIds").map(String),
  };

  const admin = createAdminClient();

  try {
    const productId = id
      ? (await updateProductForAdmin(admin, id, input), id)
      : await createProductForAdmin(admin, input);

    revalidateTag("products", "max");
    revalidateTag("collections", "max");
    revalidatePath("/admin/products");

    return { productId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save this product.";
    const friendly = message.includes("products_slug_key")
      ? "That slug is already in use by another product."
      : "Could not save this product. Please check the fields and try again.";
    return { error: friendly };
  }
}

export async function setProductActiveAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("isActive") === "true";
  if (!id) return;

  const admin = createAdminClient();
  await setProductActive(admin, id, isActive);
  revalidateTag("products", "max");
  revalidatePath("/admin/products");
}

export interface ImageUploadState {
  error?: string;
}

export async function uploadProductImageAction(
  productId: string,
  _prevState: ImageUploadState,
  formData: FormData
): Promise<ImageUploadState> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file to upload." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadImage(buffer, `products/${productId}`);

  const admin = createAdminClient();
  await addProductImage(admin, productId, {
    imageUrl: uploaded.url,
    cloudinaryPublicId: uploaded.publicId,
    alt: String(formData.get("alt") ?? ""),
    width: uploaded.width,
    height: uploaded.height,
  });

  revalidateTag("products", "max");
  revalidatePath(`/admin/products/${productId}`);
  return {};
}

export async function deleteProductImageAction(
  imageId: string,
  cloudinaryPublicId: string | null,
  productId: string
): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  await deleteProductImageRow(admin, imageId);
  if (cloudinaryPublicId) {
    await deleteImage(cloudinaryPublicId).catch(() => {
      // Row is already gone; a leftover Cloudinary asset isn't worth failing the request over.
    });
  }
  revalidateTag("products", "max");
  revalidatePath(`/admin/products/${productId}`);
}

export async function reorderProductImagesAction(productId: string, orderedImageIds: string[]): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  await reorderProductImages(admin, orderedImageIds);
  revalidateTag("products", "max");
  revalidatePath(`/admin/products/${productId}`);
}
