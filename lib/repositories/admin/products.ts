import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { SIZES, type SleeveOption } from "@/types/product";

const SLEEVE_OPTIONS: SleeveOption[] = ["Sleeveless", "3/4 Sleeve", "Full Sleeve", '18" Sleeve'];

export interface AdminProductListRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  is_new: boolean;
  is_best_seller: boolean;
  is_sold_out: boolean;
  is_active: boolean;
  thumbnail: string | null;
  collectionNames: string[];
}

export async function listAllProductsForAdmin(
  admin: SupabaseClient<Database>,
  search?: string
): Promise<AdminProductListRow[]> {
  let query = admin
    .from("products")
    .select(
      `id, slug, name, category, price, is_new, is_best_seller, is_sold_out, is_active, sort_order,
       product_images ( image_url, sort_order ),
       product_collections ( collections ( name ) )`
    )
    .order("sort_order", { ascending: true });

  if (search?.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error } = await query.overrideTypes<
    {
      id: string;
      slug: string;
      name: string;
      category: string;
      price: number;
      is_new: boolean;
      is_best_seller: boolean;
      is_sold_out: boolean;
      is_active: boolean;
      product_images: { image_url: string; sort_order: number }[];
      product_collections: { collections: { name: string } | null }[];
    }[],
    { merge: false }
  >();

  if (error) throw new Error(`listAllProductsForAdmin: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: row.price,
    is_new: row.is_new,
    is_best_seller: row.is_best_seller,
    is_sold_out: row.is_sold_out,
    is_active: row.is_active,
    thumbnail: [...row.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url ?? null,
    collectionNames: row.product_collections.map((pc) => pc.collections?.name).filter((n): n is string => Boolean(n)),
  }));
}

export interface AdminProductImage {
  id: string;
  imageUrl: string;
  cloudinaryPublicId: string | null;
  alt: string;
  sortOrder: number;
}

export interface AdminProductDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  tags: string[];
  isNew: boolean;
  isBestSeller: boolean;
  isSoldOut: boolean;
  isActive: boolean;
  customSizeEnabled: boolean;
  fabric: string;
  washCare: string[];
  shippingInfo: string;
  fitNotes: string;
  sortOrder: number;
  stockQuantity: number;
  lowStockThreshold: number;
  sizes: string[];
  sleeveOptions: string[];
  collectionIds: string[];
  images: AdminProductImage[];
}

interface ProductDetailRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price: number | null;
  category: string;
  tags: string[];
  is_new: boolean;
  is_best_seller: boolean;
  is_sold_out: boolean;
  is_active: boolean;
  custom_size_enabled: boolean;
  fabric: string;
  wash_care: string[];
  shipping_info: string;
  fit_notes: string;
  sort_order: number;
  stock_quantity: number;
  low_stock_threshold: number;
  product_images: { id: string; image_url: string; cloudinary_public_id: string | null; alt: string; sort_order: number }[];
  product_sizes: { size: string }[];
  product_sleeve_options: { sleeve_option: string }[];
  product_collections: { collection_id: string }[];
}

export async function getProductForAdmin(
  admin: SupabaseClient<Database>,
  id: string
): Promise<AdminProductDetail | null> {
  const { data, error } = await admin
    .from("products")
    .select(
      `*,
       product_images ( id, image_url, cloudinary_public_id, alt, sort_order ),
       product_sizes ( size ),
       product_sleeve_options ( sleeve_option ),
       product_collections ( collection_id )`
    )
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<ProductDetailRow, { merge: false }>();

  if (error) throw new Error(`getProductForAdmin: ${error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    description: data.description,
    shortDescription: data.short_description,
    price: data.price,
    compareAtPrice: data.compare_at_price,
    category: data.category,
    tags: data.tags,
    isNew: data.is_new,
    isBestSeller: data.is_best_seller,
    isSoldOut: data.is_sold_out,
    isActive: data.is_active,
    customSizeEnabled: data.custom_size_enabled,
    fabric: data.fabric,
    washCare: data.wash_care,
    shippingInfo: data.shipping_info,
    fitNotes: data.fit_notes,
    sortOrder: data.sort_order,
    stockQuantity: data.stock_quantity,
    lowStockThreshold: data.low_stock_threshold,
    sizes: data.product_sizes.map((s) => s.size),
    sleeveOptions: data.product_sleeve_options.map((s) => s.sleeve_option),
    collectionIds: data.product_collections.map((c) => c.collection_id),
    images: [...data.product_images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({
        id: img.id,
        imageUrl: img.image_url,
        cloudinaryPublicId: img.cloudinary_public_id,
        alt: img.alt,
        sortOrder: img.sort_order,
      })),
  };
}

export interface ProductFormInput {
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  tags: string[];
  isNew: boolean;
  isBestSeller: boolean;
  isSoldOut: boolean;
  isActive: boolean;
  customSizeEnabled: boolean;
  fabric: string;
  washCare: string[];
  shippingInfo: string;
  fitNotes: string;
  sortOrder: number;
  stockQuantity: number;
  lowStockThreshold: number;
  sizes: string[];
  sleeveOptions: string[];
  collectionIds: string[];
}

async function replaceProductRelations(
  admin: SupabaseClient<Database>,
  productId: string,
  input: ProductFormInput
): Promise<void> {
  await admin.from("product_sizes").delete().eq("product_id", productId);
  const validSizes = input.sizes.filter((s) => (SIZES as string[]).includes(s));
  if (validSizes.length) {
    await admin
      .from("product_sizes")
      .insert(validSizes.map((size, index) => ({ product_id: productId, size, sort_order: index })));
  }

  await admin.from("product_sleeve_options").delete().eq("product_id", productId);
  const validSleeves = input.sleeveOptions.filter((s) => (SLEEVE_OPTIONS as string[]).includes(s));
  if (validSleeves.length) {
    await admin.from("product_sleeve_options").insert(
      validSleeves.map((sleeve_option, index) => ({ product_id: productId, sleeve_option, sort_order: index }))
    );
  }

  await admin.from("product_collections").delete().eq("product_id", productId);
  if (input.collectionIds.length) {
    await admin.from("product_collections").insert(
      input.collectionIds.map((collection_id, index) => ({
        product_id: productId,
        collection_id,
        sort_order: index,
      }))
    );
  }
}

function toProductColumns(input: ProductFormInput) {
  return {
    slug: input.slug,
    name: input.name,
    description: input.description,
    short_description: input.shortDescription,
    price: input.price,
    compare_at_price: input.compareAtPrice,
    category: input.category,
    tags: input.tags,
    is_new: input.isNew,
    is_best_seller: input.isBestSeller,
    is_sold_out: input.isSoldOut,
    is_active: input.isActive,
    custom_size_enabled: input.customSizeEnabled,
    fabric: input.fabric,
    wash_care: input.washCare,
    shipping_info: input.shippingInfo,
    fit_notes: input.fitNotes,
    sort_order: input.sortOrder,
    stock_quantity: input.stockQuantity,
    low_stock_threshold: input.lowStockThreshold,
  };
}

export async function createProductForAdmin(
  admin: SupabaseClient<Database>,
  input: ProductFormInput
): Promise<string> {
  const { data, error } = await admin.from("products").insert(toProductColumns(input)).select("id").single();
  if (error || !data) throw new Error(`createProductForAdmin: ${error?.message}`);
  await replaceProductRelations(admin, data.id, input);
  return data.id;
}

export async function updateProductForAdmin(
  admin: SupabaseClient<Database>,
  id: string,
  input: ProductFormInput
): Promise<void> {
  const { error } = await admin.from("products").update(toProductColumns(input)).eq("id", id);
  if (error) throw new Error(`updateProductForAdmin: ${error.message}`);
  await replaceProductRelations(admin, id, input);
}

/** Soft delete only — a hard delete could orphan order_items' historical snapshot reference. */
export async function setProductActive(
  admin: SupabaseClient<Database>,
  id: string,
  isActive: boolean
): Promise<void> {
  const { error } = await admin.from("products").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(`setProductActive: ${error.message}`);
}

export async function bulkSetProductActive(
  admin: SupabaseClient<Database>,
  ids: string[],
  isActive: boolean
): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await admin.from("products").update({ is_active: isActive }).in("id", ids);
  if (error) throw new Error(`bulkSetProductActive: ${error.message}`);
}

/** Which of these product ids have ever appeared in a paid/placed order — the ones a hard delete must never touch. */
export async function getProductIdsWithOrders(admin: SupabaseClient<Database>, ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  const { data, error } = await admin.from("order_items").select("product_id").in("product_id", ids);
  if (error) throw new Error(`getProductIdsWithOrders: ${error.message}`);
  return new Set(data.map((row) => row.product_id).filter((id): id is string => id !== null));
}

export async function getProductNamesForIds(
  admin: SupabaseClient<Database>,
  ids: string[]
): Promise<{ id: string; name: string }[]> {
  if (ids.length === 0) return [];
  const { data, error } = await admin.from("products").select("id, name").in("id", ids);
  if (error) throw new Error(`getProductNamesForIds: ${error.message}`);
  return data;
}

export async function getCloudinaryIdsForProducts(admin: SupabaseClient<Database>, ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const { data, error } = await admin
    .from("product_images")
    .select("cloudinary_public_id")
    .in("product_id", ids)
    .not("cloudinary_public_id", "is", null);
  if (error) throw new Error(`getCloudinaryIdsForProducts: ${error.message}`);
  return data.map((row) => row.cloudinary_public_id).filter((id): id is string => id !== null);
}

/**
 * A genuine hard delete — deliberately narrower than setProductActive's
 * soft delete. Only ever called (see bulkDeleteProductsAction) for products
 * confirmed via getProductIdsWithOrders to have zero order history, so the
 * "could orphan order_items' historical snapshot reference" concern above
 * never applies here. product_images/product_sizes/product_sleeve_options/
 * product_collections all cascade; Cloudinary cleanup is the caller's job.
 */
export async function bulkDeleteProducts(admin: SupabaseClient<Database>, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await admin.from("products").delete().in("id", ids);
  if (error) throw new Error(`bulkDeleteProducts: ${error.message}`);
}

export async function addProductImage(
  admin: SupabaseClient<Database>,
  productId: string,
  image: { imageUrl: string; cloudinaryPublicId: string; alt: string; width: number; height: number }
): Promise<void> {
  const { count } = await admin
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  const { error } = await admin.from("product_images").insert({
    product_id: productId,
    image_url: image.imageUrl,
    cloudinary_public_id: image.cloudinaryPublicId,
    alt: image.alt,
    width: image.width,
    height: image.height,
    sort_order: count ?? 0,
  });
  if (error) throw new Error(`addProductImage: ${error.message}`);
}

export async function deleteProductImageRow(admin: SupabaseClient<Database>, imageId: string): Promise<void> {
  const { error } = await admin.from("product_images").delete().eq("id", imageId);
  if (error) throw new Error(`deleteProductImageRow: ${error.message}`);
}

export async function reorderProductImages(
  admin: SupabaseClient<Database>,
  orderedImageIds: string[]
): Promise<void> {
  await Promise.all(
    orderedImageIds.map((id, index) => admin.from("product_images").update({ sort_order: index }).eq("id", id))
  );
}
