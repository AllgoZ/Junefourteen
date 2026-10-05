"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  // Different piece combos are different lines; the same combo merges — sort
  // the ids so selection order doesn't matter.
  const pieceKey = item.selectedPieceIds?.length ? [...item.selectedPieceIds].sort().join("+") : "none";
  return [item.productId, item.size ?? "std", item.sleeve ?? "any", pieceKey].join("-");
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

  // Per-line debounce for updateQuantity's server write (below) — declared
  // outside any one callback since removeItem also needs to cancel a
  // pending write for a line that just got deleted.
  const quantityWriteTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

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
        // Unlike updateQuantity/removeItem below, a brand-new line's
        // optimistic lineId is only the client-side composite from
        // buildLineId — not yet the real cart_items.id that a later
        // updateQuantity/removeItem call needs to target the right row
        // (lib/mappers/cart.ts#dbCartItemToCartItem sets lineId: row.id).
        // This resync is what upgrades it once the row actually exists
        // server-side, so unlike the other two it has to stay.
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
      if (!isAuthed) return;

      // Debounced and, unlike addItem, never resynced afterward. Rapid +/-
      // clicks used to fire one Server Action *and* one full cart refetch
      // per click — on anything but a fast connection, those overlapping
      // round trips could resolve out of order and visibly flicker the
      // quantity back before "correcting" itself. A quantity change never
      // moves a line to a different row, so the optimistic update above is
      // already the full truth; only the debounced write below is needed to
      // persist it, once the user actually stops clicking.
      const timers = quantityWriteTimers.current;
      const pending = timers.get(lineId);
      if (pending) clearTimeout(pending);
      timers.set(
        lineId,
        setTimeout(() => {
          timers.delete(lineId);
          updateCartItemQuantityAction(lineId, quantity);
        }, 400)
      );
    },
    [isAuthed]
  );

  const removeItem = useCallback(
    (lineId: string) => {
      cartStore.set((prev) => prev.filter((i) => i.lineId !== lineId));

      const pending = quantityWriteTimers.current.get(lineId);
      if (pending) {
        clearTimeout(pending);
        quantityWriteTimers.current.delete(lineId);
      }
      if (isAuthed) {
        removeCartItemAction(lineId);
      }
    },
    [isAuthed]
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
