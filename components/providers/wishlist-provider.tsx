"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import type { WishlistItem } from "@/types/cart";
import { createLocalStore } from "@/lib/local-store";

const wishlistStore = createLocalStore<WishlistItem[]>("antara:wishlist", []);

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

  const addItem = useCallback((item: WishlistItem) => {
    wishlistStore.set((prev) =>
      prev.some((i) => i.productId === item.productId) ? prev : [item, ...prev]
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    wishlistStore.set((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

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
