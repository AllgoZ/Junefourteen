"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import type { WishlistItem } from "@/types/cart";
import { createLocalStore } from "@/lib/local-store";
import { createClient } from "@/lib/supabase/client";
import { getIsAuthed, setIsAuthed, subscribeIsAuthed } from "@/lib/auth/client-auth-store";
import {
  addWishlistItemAction,
  getWishlistForCurrentUser,
  removeWishlistItemAction,
} from "@/lib/services/wishlist";

const wishlistStore = createLocalStore<WishlistItem[]>("antara:wishlist", []);

/** For sign-in/out flows — see setCartItemsLocally's twin in cart-provider.tsx. */
export function setWishlistItemsLocally(items: WishlistItem[]): void {
  wishlistStore.set(items);
}

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  isWishlisted: (productId: string) => boolean;
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: WishlistItem) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(
    wishlistStore.subscribe,
    wishlistStore.getSnapshot,
    wishlistStore.getServerSnapshot
  );
  const isAuthed = useSyncExternalStore(subscribeIsAuthed, getIsAuthed, () => false);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" && session) {
        setIsAuthed(true);
        getWishlistForCurrentUser().then(setWishlistItemsLocally);
      } else if (event === "SIGNED_OUT") {
        setIsAuthed(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const syncFromServer = useCallback(() => {
    if (!getIsAuthed()) return;
    getWishlistForCurrentUser().then(setWishlistItemsLocally);
  }, []);

  const addItem = useCallback(
    (item: WishlistItem) => {
      wishlistStore.set((prev) => (prev.some((i) => i.productId === item.productId) ? prev : [item, ...prev]));
      if (isAuthed) {
        addWishlistItemAction(item.productId).then(syncFromServer);
      }
    },
    [isAuthed, syncFromServer]
  );

  const removeItem = useCallback(
    (productId: string) => {
      wishlistStore.set((prev) => prev.filter((i) => i.productId !== productId));
      if (isAuthed) {
        removeWishlistItemAction(productId).then(syncFromServer);
      }
    },
    [isAuthed, syncFromServer]
  );

  const isWishlisted = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  const toggleItem = useCallback(
    (item: WishlistItem) => {
      if (isWishlisted(item.productId)) {
        removeItem(item.productId);
      } else {
        addItem(item);
      }
    },
    [isWishlisted, addItem, removeItem]
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      count: items.length,
      isWishlisted,
      addItem,
      removeItem,
      toggleItem,
    }),
    [items, isWishlisted, addItem, removeItem, toggleItem]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
