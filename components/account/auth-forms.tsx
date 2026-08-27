"use client";

import { useActionState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signIn, signUp, type AuthFormState } from "@/lib/services/auth";
import { useCart } from "@/components/providers/cart-provider";
import { setCartItemsLocally } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { setWishlistItemsLocally } from "@/components/providers/wishlist-provider";
import { setIsAuthed } from "@/lib/auth/client-auth-store";

const INITIAL_STATE: AuthFormState = {};

export function AccountAuthForms() {
  return (
    <Tabs defaultValue="sign-in" className="mt-8">
      <TabsList className="w-full">
        <TabsTrigger value="sign-in" className="flex-1">
          Sign In
        </TabsTrigger>
        <TabsTrigger value="create-account" className="flex-1">
          Create Account
        </TabsTrigger>
      </TabsList>
      <TabsContent value="sign-in" className="mt-6">
        <SignInForm />
      </TabsContent>
      <TabsContent value="create-account" className="mt-6">
        <SignUpForm />
      </TabsContent>
    </Tabs>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

/**
 * Hidden fields carrying the guest cart/wishlist snapshot at submit time —
 * lib/services/auth.ts's signIn/signUp merge these into the account
 * server-side and hand back the merged result, which useAuthSuccessSync
 * below applies to the local stores directly. See cart-provider.tsx's
 * top-of-file comment for why this doesn't rely on a client auth listener.
 */
export function GuestDataFields() {
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();

  const guestCart = cartItems.map(({ productId, size, sleeve, customMeasurements, quantity }) => ({
    productId,
    size,
    sleeve,
    customMeasurements,
    quantity,
  }));
  const guestWishlist = wishlistItems.map((item) => item.productId);

  return (
    <>
      <input type="hidden" name="guestCart" value={JSON.stringify(guestCart)} />
      <input type="hidden" name="guestWishlist" value={JSON.stringify(guestWishlist)} />
    </>
  );
}

/**
 * No router.push/refresh here: signIn/signUp already run from this exact
 * route (/account), and both call a Supabase Auth method that sets the
 * session cookie via cookies().set() (lib/supabase/server.ts) — per Next's
 * Server Action model, a cookie mutation inside the action automatically
 * re-renders the invoking route and ships the fresh RSC payload in the
 * same response useActionState already consumes. A push (to the identical
 * current URL) + refresh() here was a fully redundant second round trip,
 * doubling the wait between clicking "Sign In" and seeing the account view.
 */
function useAuthSuccessSync(state: AuthFormState) {
  useEffect(() => {
    if (!state.success) return;
    setIsAuthed(true);
    setCartItemsLocally(state.success.cart);
    setWishlistItemsLocally(state.success.wishlist);
  }, [state.success]);
}

function SignInForm() {
  const [state, action, pending] = useActionState(signIn, INITIAL_STATE);
  useAuthSuccessSync(state);

  return (
    <form action={action} className="flex flex-col gap-4">
      <GuestDataFields />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signin-email">Email</Label>
        <Input id="signin-email" name="email" type="email" required autoComplete="email" />
        <FieldError message={state.errors?.email} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
        <FieldError message={state.errors?.password} />
      </div>
      <FieldError message={state.errors?.form} />
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}

function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, INITIAL_STATE);
  useAuthSuccessSync(state);

  if (state.message) {
    return <p className="text-sm text-foreground">{state.message}</p>;
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <GuestDataFields />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-name">Full Name</Label>
        <Input id="signup-name" name="fullName" required autoComplete="name" />
        <FieldError message={state.errors?.fullName} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-email">Email</Label>
        <Input id="signup-email" name="email" type="email" required autoComplete="email" />
        <FieldError message={state.errors?.email} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
        />
        <FieldError message={state.errors?.password} />
      </div>
      <FieldError message={state.errors?.form} />
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Creating account…" : "Create Account"}
      </Button>
    </form>
  );
}
