"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/services/auth";
import { setCartItemsLocally } from "@/components/providers/cart-provider";
import { setWishlistItemsLocally } from "@/components/providers/wishlist-provider";
import { setIsAuthed } from "@/lib/auth/client-auth-store";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          // Clear first — the account (now signed out) shouldn't briefly
          // keep showing the previous session's cart/wishlist, especially
          // on a shared device.
          setIsAuthed(false);
          setCartItemsLocally([]);
          setWishlistItemsLocally([]);
          await signOut();
        })
      }
    >
      {pending ? "Signing out…" : "Sign Out"}
    </Button>
  );
}
