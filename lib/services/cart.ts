"use server";

import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/auth/dal";
import {
  addCartItem,
  clearCartItems,
  getOrCreateCartId,
  listCartItemsWithProduct,
  removeCartItem,
  updateCartItemQuantity,
  type CartItemInput,
} from "@/lib/repositories/cart";
import { dbCartItemToCartItem } from "@/lib/mappers/cart";
import type { CartItem } from "@/types/cart";
import type { Json } from "@/lib/supabase/types";

/** Null when signed out — every action below is a no-op for guests, who stay on the local store. */
async function getAuthedCartId(): Promise<{ supabase: Awaited<ReturnType<typeof createClient>>; cartId: string } | null> {
  const user = await verifySession();
  if (!user) return null;
  const supabase = await createClient();
  const cartId = await getOrCreateCartId(supabase, user.id);
  return { supabase, cartId };
}

export async function getCartForCurrentUser(): Promise<CartItem[]> {
  const ctx = await getAuthedCartId();
  if (!ctx) return [];
  const rows = await listCartItemsWithProduct(ctx.supabase, ctx.cartId);
  return rows.map(dbCartItemToCartItem).filter((item): item is CartItem => item !== null);
}

/**
 * Called once, right after sign-in, with whatever was in the guest's
 * localStorage cart. Upserts each line into the now-authenticated cart
 * (merging with anything already saved there) and returns the merged
 * result so the client can replace its local cache in one round trip.
 */
export async function mergeGuestCart(
  guestItems: Pick<
    CartItem,
    "productId" | "size" | "sleeve" | "customMeasurements" | "selectedPieceIds" | "quantity"
  >[]
): Promise<CartItem[]> {
  const ctx = await getAuthedCartId();
  if (!ctx) return [];

  for (const item of guestItems) {
    const input: CartItemInput = {
      productId: item.productId,
      size: item.size,
      sleeveOption: item.sleeve,
      customMeasurements: item.customMeasurements as Json | undefined,
      selectedPieceIds: item.selectedPieceIds,
      quantity: item.quantity,
    };
    await addCartItem(ctx.supabase, ctx.cartId, input);
  }

  const rows = await listCartItemsWithProduct(ctx.supabase, ctx.cartId);
  return rows.map(dbCartItemToCartItem).filter((item): item is CartItem => item !== null);
}

export async function addCartItemAction(
  item: Pick<CartItem, "productId" | "size" | "sleeve" | "customMeasurements" | "selectedPieceIds">,
  quantity: number
): Promise<void> {
  const ctx = await getAuthedCartId();
  if (!ctx) return;
  await addCartItem(ctx.supabase, ctx.cartId, {
    productId: item.productId,
    size: item.size,
    sleeveOption: item.sleeve,
    customMeasurements: item.customMeasurements as Json | undefined,
    selectedPieceIds: item.selectedPieceIds,
    quantity,
  });
}

export async function updateCartItemQuantityAction(lineId: string, quantity: number): Promise<void> {
  const ctx = await getAuthedCartId();
  if (!ctx) return;
  await updateCartItemQuantity(ctx.supabase, lineId, quantity);
}

export async function removeCartItemAction(lineId: string): Promise<void> {
  const ctx = await getAuthedCartId();
  if (!ctx) return;
  await removeCartItem(ctx.supabase, lineId);
}

export async function clearCartAction(): Promise<void> {
  const ctx = await getAuthedCartId();
  if (!ctx) return;
  await clearCartItems(ctx.supabase, ctx.cartId);
}
