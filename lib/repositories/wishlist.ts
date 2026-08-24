import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type WishlistItemRow = Database["public"]["Tables"]["wishlist_items"]["Row"];

export interface WishlistItemWithProduct extends WishlistItemRow {
  products: {
    slug: string;
    name: string;
    price: number;
    compare_at_price: number | null;
    is_sold_out: boolean;
    product_images: { id: string; image_url: string; alt: string; tone: number; sort_order: number }[];
  } | null;
}

const WISHLIST_SELECT = `
  *,
  products (
    slug, name, price, compare_at_price, is_sold_out,
    product_images ( id, image_url, alt, tone, sort_order )
  )
`;

export async function listWishlistItemsWithProduct(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<WishlistItemWithProduct[]> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select(WISHLIST_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .overrideTypes<WishlistItemWithProduct[], { merge: false }>();

  if (error) throw new Error(`listWishlistItemsWithProduct: ${error.message}`);
  return data;
}

/** Idempotent — a duplicate add is a no-op, matching the guest store's addItem behavior. */
export async function addWishlistItem(
  supabase: SupabaseClient<Database>,
  userId: string,
  productId: string
): Promise<void> {
  const { error } = await supabase
    .from("wishlist_items")
    .upsert({ user_id: userId, product_id: productId }, { onConflict: "user_id,product_id", ignoreDuplicates: true });
  if (error) throw new Error(`addWishlistItem: ${error.message}`);
}

export async function removeWishlistItem(
  supabase: SupabaseClient<Database>,
  userId: string,
  productId: string
): Promise<void> {
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
  if (error) throw new Error(`removeWishlistItem: ${error.message}`);
}
