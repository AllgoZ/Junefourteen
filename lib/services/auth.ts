"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateSignIn, validateSignUp, validateMobile, normalizePhone, hasAuthErrors } from "@/lib/validation";
import { mergeGuestCart } from "@/lib/services/cart";
import { mergeGuestWishlist } from "@/lib/services/wishlist";
import type { CartItem, WishlistItem } from "@/types/cart";

export interface AuthFormState {
  errors?: { fullName?: string; email?: string; password?: string; form?: string };
  message?: string;
  success?: { cart: CartItem[]; wishlist: WishlistItem[] };
}

/** Hidden form fields (see auth-forms.tsx) carry the guest localStorage snapshot at submit time. */
function parseGuestCart(formData: FormData): Pick<CartItem, "productId" | "size" | "sleeve" | "customMeasurements" | "quantity">[] {
  try {
    const raw = formData.get("guestCart");
    return typeof raw === "string" ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function parseGuestWishlist(formData: FormData): string[] {
  try {
    const raw = formData.get("guestWishlist");
    return typeof raw === "string" ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function mergeAndRespond(formData: FormData): Promise<AuthFormState> {
  const [cart, wishlist] = await Promise.all([
    mergeGuestCart(parseGuestCart(formData)),
    mergeGuestWishlist(parseGuestWishlist(formData)),
  ]);
  return { success: { cart, wishlist } };
}

export async function signIn(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const errors = validateSignIn({ email, password });
  if (hasAuthErrors(errors)) return { errors };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const form = error.code === "email_not_confirmed"
      ? "Confirm your email before signing in — check your inbox for the link."
      : "Incorrect email or password.";
    return { errors: { form } };
  }

  return mergeAndRespond(formData);
}

export async function signUp(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const errors = validateSignUp({ fullName, email, password });
  if (hasAuthErrors(errors)) return { errors };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    const form =
      error.code === "over_email_send_rate_limit"
        ? "Too many attempts — please wait a few minutes and try again."
        : error.message.toLowerCase().includes("already registered")
          ? "An account with this email already exists."
          : "Could not create your account. Please try again.";
    return { errors: { form } };
  }

  // Email confirmation is required on this project, so signUp doesn't return
  // an active session — surface that instead of pretending we're signed in.
  if (!data.session) {
    return { message: "Check your email to confirm your account, then sign in." };
  }

  return mergeAndRespond(formData);
}

export interface MobileAuthFormState {
  errors?: { mobile?: string; form?: string };
  success?: { cart: CartItem[]; wishlist: WishlistItem[] };
}

/**
 * Quick account creation from the add-to-bag/buy-now popup (see
 * components/account/mobile-signup-dialog.tsx) — mobile number only, no
 * OTP/password the user ever sees. A random password is generated purely to
 * satisfy the signInWithPassword call right below; it's never surfaced,
 * stored, or reused anywhere else. v1 deliberately doesn't handle "this
 * number already has an account" beyond a clear error message —
 * passwordless re-login for a returning mobile-only customer is a
 * next-version problem, not solved here.
 */
export async function signUpWithMobile(
  _prevState: MobileAuthFormState,
  formData: FormData
): Promise<MobileAuthFormState> {
  const mobile = String(formData.get("mobile") ?? "").trim();

  const mobileError = validateMobile(mobile);
  if (mobileError) return { errors: { mobile: mobileError } };

  const phone = normalizePhone(mobile);
  const password = crypto.randomUUID();

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    phone,
    phone_confirm: true,
    password,
  });

  if (error || !data.user) {
    const form =
      error?.code === "phone_exists"
        ? "An account with this number already exists. Sign in from your account page."
        : "Could not create your account. Please try again.";
    return { errors: { form } };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ phone, password });
  if (signInError) {
    return { errors: { form: "Account created, but sign-in failed — please try signing in." } };
  }

  // handle_new_user() only copies email/full_name onto the new profiles row
  // (see supabase/migrations/0002_triggers.sql) — phone needs setting explicitly.
  await supabase.from("profiles").update({ phone }).eq("id", data.user.id);

  return mergeAndRespond(formData);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/account");
}
