"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { CartItem } from "@/types/cart";
import { createLocalStore } from "@/lib/local-store";
import { createClient } from "@/lib/supabase/client";
import { getIsAuthed, setIsAuthed, subscribeIsAuthed } from "@/lib/auth/client-auth-store";
import {
  addCartItemAction,
  clearCartAction,
  getCartForCurrentUser,
  removeCartItemAction,
  updateCartItemQuantityAction,
} from "@/lib/services/cart";

const cartStore = createLocalStore<CartItem[]>("antara:cart", []);

/**
 * For sign-in/out flows to update the shared cart cache directly (see
 * components/account/auth-forms.tsx and sign-out-button.tsx) — kept
 * separate from the store's other internals so CartProvider stays the only
 * thing that knows about server write-through.
 */
export function setCartItemsLocally(items: CartItem[]): void {
  cartStore.set(items);
}

function buildLineId(item: Omit<CartItem, "lineId" | "quantity">): string {
  if (item.customMeasurements) {
    return `${item.productId}-custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
  return [item.productId, item.size ?? "std", item.sleeve ?? "any"].join("-");
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "lineId" | "quantity">, quantity?: number) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot
  );
  const isAuthed = useSyncExternalStore(subscribeIsAuthed, getIsAuthed, () => false);
  const [isOpen, setIsOpen] = useState(false);

  // Already-signed-in-on-load case: a fresh sign-in (with its own merge) is
  // handled explicitly by auth-forms.tsx, not here — this only covers
  // opening the app with an existing session, when the local store still
  // has whatever was cached from the last visit.
  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" && session) {
        setIsAuthed(true);
        getCartForCurrentUser().then(setCartItemsLocally);
      } else if (event === "SIGNED_OUT") {
        setIsAuthed(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const syncFromServer = useCallback(() => {
    if (!getIsAuthed()) return;
    getCartForCurrentUser().then(setCartItemsLocally);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "lineId" | "quantity">, quantity = 1) => {
      const lineId = buildLineId(item);
      cartStore.set((prev) => {
        const existing = prev.find((i) => i.lineId === lineId);
        if (existing) {
          return prev.map((i) => (i.lineId === lineId ? { ...i, quantity: i.quantity + quantity } : i));
        }
        return [...prev, { ...item, lineId, quantity }];
      });
      if (isAuthed) {
        addCartItemAction(item, quantity).then(syncFromServer);
      }
    },
    [isAuthed, syncFromServer]
  );

  const updateQuantity = useCallback(
    (lineId: string, quantity: number) => {
      cartStore.set((prev) =>
        quantity <= 0
          ? prev.filter((i) => i.lineId !== lineId)
          : prev.map((i) => (i.lineId === lineId ? { ...i, quantity } : i))
      );
      if (isAuthed) {
        updateCartItemQuantityAction(lineId, quantity).then(syncFromServer);
      }
    },
    [isAuthed, syncFromServer]
  );

  const removeItem = useCallback(
    (lineId: string) => {
      cartStore.set((prev) => prev.filter((i) => i.lineId !== lineId));
      if (isAuthed) {
        removeCartItemAction(lineId).then(syncFromServer);
      }
    },
    [isAuthed, syncFromServer]
  );

  const clearCart = useCallback(() => {
    cartStore.set([]);
    if (isAuthed) {
      clearCartAction();
    }
  }, [isAuthed]);

  const { itemCount, subtotal } = useMemo(
    () => ({
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotal,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, itemCount, subtotal, isOpen, addItem, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
