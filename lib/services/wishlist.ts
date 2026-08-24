"use server";

import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/auth/dal";
import { addWishlistItem, listWishlistItemsWithProduct, removeWishlistItem } from "@/lib/repositories/wishlist";
import { dbWishlistItemToWishlistItem } from "@/lib/mappers/wishlist";
import type { WishlistItem } from "@/types/cart";

export async function getWishlistForCurrentUser(): Promise<WishlistItem[]> {
  const user = await verifySession();
  if (!user) return [];
  const supabase = await createClient();
  const rows = await listWishlistItemsWithProduct(supabase, user.id);
  return rows.map(dbWishlistItemToWishlistItem).filter((item): item is WishlistItem => item !== null);
}

/** Called once, right after sign-in, with the guest's localStorage wishlist product ids. */
export async function mergeGuestWishlist(productIds: string[]): Promise<WishlistItem[]> {
  const user = await verifySession();
  if (!user) return [];
  const supabase = await createClient();

  for (const productId of productIds) {
    await addWishlistItem(supabase, user.id, productId);
  }

  const rows = await listWishlistItemsWithProduct(supabase, user.id);
  return rows.map(dbWishlistItemToWishlistItem).filter((item): item is WishlistItem => item !== null);
}

export async function addWishlistItemAction(productId: string): Promise<void> {
  const user = await verifySession();
  if (!user) return;
  const supabase = await createClient();
  await addWishlistItem(supabase, user.id, productId);
}

export async function removeWishlistItemAction(productId: string): Promise<void> {
  const user = await verifySession();
  if (!user) return;
  const supabase = await createClient();
  await removeWishlistItem(supabase, user.id, productId);
}
