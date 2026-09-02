import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/types";

type CartItemRow = Database["public"]["Tables"]["cart_items"]["Row"];

export interface CartItemWithProduct extends CartItemRow {
  products: {
    slug: string;
    name: string;
    price: number;
    compare_at_price: number | null;
    is_sold_out: boolean;
    product_images: { id: string; image_url: string; alt: string; tone: number; sort_order: number }[];
    product_pieces: { id: string; name: string; price: number; sort_order: number }[];
  } | null;
}

export async function getOrCreateCartId(supabase: SupabaseClient<Database>, userId: string): Promise<string> {
  const { data: existing } = await supabase.from("carts").select("id").eq("user_id", userId).maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (error || !data) throw new Error(`getOrCreateCartId: ${error?.message}`);
  return data.id;
}

const CART_ITEM_SELECT = `
  *,
  products (
    slug, name, price, compare_at_price, is_sold_out,
    product_images ( id, image_url, alt, tone, sort_order ),
    product_pieces ( id, name, price, sort_order )
  )
`;

export async function listCartItemsWithProduct(
  supabase: SupabaseClient<Database>,
  cartId: string
): Promise<CartItemWithProduct[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select(CART_ITEM_SELECT)
    .eq("cart_id", cartId)
    .overrideTypes<CartItemWithProduct[], { merge: false }>();

  if (error) throw new Error(`listCartItemsWithProduct: ${error.message}`);
  return data;
}

export interface CartItemInput {
  productId: string;
  size?: string;
  sleeveOption?: string;
  customMeasurements?: Json;
  selectedPieceIds?: string[];
  quantity: number;
}

/** Deterministic key for a set of piece ids — sorted so order doesn't matter. */
function pieceKey(ids: readonly string[] | null | undefined): string {
  return ids && ids.length ? [...ids].map(String).sort().join(",") : "";
}

function matchesLine(row: CartItemRow, item: CartItemInput): boolean {
  if (row.custom_measurements !== null || item.customMeasurements) return false;
  const rowPieceIds = Array.isArray(row.selected_piece_ids)
    ? (row.selected_piece_ids as unknown[]).map(String)
    : null;
  return (
    row.product_id === item.productId &&
    (row.size ?? null) === (item.size ?? null) &&
    (row.sleeve_option ?? null) === (item.sleeveOption ?? null) &&
    pieceKey(rowPieceIds) === pieceKey(item.selectedPieceIds)
  );
}

/**
 * Merges into an existing line the same way components/providers/cart-
 * provider.tsx's buildLineId does for the guest store: standard lines with
 * the same product+size+sleeve add quantities together, custom-measurement
 * lines never merge. Implemented in application code (fetch cart_items,
 * find the match, update-or-insert) rather than a DB upsert, because the
 * merge rule is a partial/expression unique index
 * (supabase/migrations/0001_schema.sql's cart_items_line_identity_idx) that
 * the JS client's upsert() can't target directly — cart sizes are small
 * enough per user that this round trip is cheap.
 */
export async function addCartItem(
  supabase: SupabaseClient<Database>,
  cartId: string,
  item: CartItemInput
): Promise<void> {
  if (!item.customMeasurements) {
    const { data: rows, error } = await supabase.from("cart_items").select("*").eq("cart_id", cartId);
    if (error) throw new Error(`addCartItem (lookup): ${error.message}`);

    const existing = rows.find((row) => matchesLine(row, item));
    if (existing) {
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + item.quantity })
        .eq("id", existing.id);
      if (updateError) throw new Error(`addCartItem (update): ${updateError.message}`);
      return;
    }
  }

  const { error } = await supabase.from("cart_items").insert({
    cart_id: cartId,
    product_id: item.productId,
    size: item.size ?? null,
    sleeve_option: item.sleeveOption ?? null,
    custom_measurements: item.customMeasurements ?? null,
    selected_piece_ids: item.selectedPieceIds?.length ? (item.selectedPieceIds as unknown as Json) : null,
    quantity: item.quantity,
  });
  if (error) throw new Error(`addCartItem (insert): ${error.message}`);
}

export async function updateCartItemQuantity(
  supabase: SupabaseClient<Database>,
  cartItemId: string,
  quantity: number
): Promise<void> {
  if (quantity <= 0) {
    await removeCartItem(supabase, cartItemId);
    return;
  }
  const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", cartItemId);
  if (error) throw new Error(`updateCartItemQuantity: ${error.message}`);
}

export async function removeCartItem(supabase: SupabaseClient<Database>, cartItemId: string): Promise<void> {
  const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId);
  if (error) throw new Error(`removeCartItem: ${error.message}`);
}

export async function clearCartItems(supabase: SupabaseClient<Database>, cartId: string): Promise<void> {
  const { error } = await supabase.from("cart_items").delete().eq("cart_id", cartId);
  if (error) throw new Error(`clearCartItems: ${error.message}`);
}
