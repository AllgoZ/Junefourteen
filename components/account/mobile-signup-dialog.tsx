"use client";

import { useActionState, useEffect, useId } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GuestDataFields } from "@/components/account/auth-forms";
import { signInOrSignUpWithMobile, type MobileAuthFormState } from "@/lib/services/auth";
import { setCartItemsLocally } from "@/components/providers/cart-provider";
import { setWishlistItemsLocally } from "@/components/providers/wishlist-provider";
import { setIsAuthed } from "@/lib/auth/client-auth-store";

const INITIAL_STATE: MobileAuthFormState = {};

interface MobileSignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * The add-to-bag/buy-now popup — quick account access with just a mobile
 * number, no OTP/password either signing up or signing back in (see
 * lib/services/auth.ts's signInOrSignUpWithMobile). Purely additive: the
 * caller's own add-to-cart/checkout flow always proceeds regardless of
 * what happens here (dismissing via the dialog's built-in close button
 * changes nothing) — this only ever shows for guests in the first place,
 * see add-to-bag-panel.tsx.
 */
export function MobileSignupDialog({ open, onOpenChange }: MobileSignupDialogProps) {
  const [state, action, pending] = useActionState(signInOrSignUpWithMobile, INITIAL_STATE);
  const inputId = useId();

  useEffect(() => {
    if (!state.success) return;
    setIsAuthed(true);
    setCartItemsLocally(state.success.cart);
    setWishlistItemsLocally(state.success.wishlist);
    onOpenChange(false);
  }, [state.success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in or create an account</DialogTitle>
          <DialogDescription>
            Just your mobile number — no password, no OTP. Already have an account? We&rsquo;ll
            sign you right in. You can keep shopping either way.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          <GuestDataFields />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={inputId}>Mobile Number</Label>
            <Input
              id={inputId}
              name="mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="98765 43210"
              required
            />
            {state.errors?.mobile && <p className="text-xs text-destructive">{state.errors.mobile}</p>}
          </div>
          {state.errors?.form && <p className="text-xs text-destructive">{state.errors.form}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Continuing…" : "Continue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
