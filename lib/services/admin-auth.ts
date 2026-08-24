"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/dal";
import { validateSignIn, hasAuthErrors, isValidEmail, isValidPassword } from "@/lib/validation";

export interface AdminAuthFormState {
  error?: string;
  success?: boolean;
}

export async function adminSignIn(
  _prevState: AdminAuthFormState,
  formData: FormData
): Promise<AdminAuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const errors = validateSignIn({ email, password });
  if (hasAuthErrors(errors)) return { error: "Enter a valid email and password." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { error: "Incorrect email or password." };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "This account does not have admin access." };
  }

  return { success: true };
}

export async function adminSignOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export interface UpdateCredentialsState {
  error?: string;
  message?: string;
}

/**
 * Both email and password changes re-verify the current password first
 * (a fresh signInWithPassword, not just "there's a valid session") — this is
 * the account guarding the whole CMS, so a left-unlocked/hijacked session
 * shouldn't be enough on its own to take it over.
 */
async function reverifyCurrentPassword(
  supabase: Awaited<ReturnType<typeof createClient>>,
  email: string,
  currentPassword: string
): Promise<string | null> {
  if (!currentPassword) return "Enter your current password to confirm this change.";
  const { error } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
  if (error) return "Your current password is incorrect.";
  return null;
}

export async function updateAdminEmail(
  _prevState: UpdateCredentialsState,
  formData: FormData
): Promise<UpdateCredentialsState> {
  const admin = await requireAdmin();

  const newEmail = String(formData.get("newEmail") ?? "").trim();
  const currentPassword = String(formData.get("currentPassword") ?? "");

  if (!isValidEmail(newEmail)) return { error: "Enter a valid email address." };
  if (!admin.email) return { error: "Could not verify your current account." };

  const supabase = await createClient();
  const reverifyError = await reverifyCurrentPassword(supabase, admin.email, currentPassword);
  if (reverifyError) return { error: reverifyError };

  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) {
    const message =
      error.code === "over_email_send_rate_limit"
        ? "Too many email attempts just now — please wait a few minutes and try again."
        : error.message.toLowerCase().includes("already registered")
          ? "That email is already in use by another account."
          : "Could not update your email. Please try again.";
    return { error: message };
  }

  return {
    message:
      "Confirmation links were sent to both your old and new email addresses — the change applies once you click the link in the new inbox.",
  };
}

export async function updateAdminPassword(
  _prevState: UpdateCredentialsState,
  formData: FormData
): Promise<UpdateCredentialsState> {
  const admin = await requireAdmin();

  const newPassword = String(formData.get("newPassword") ?? "");
  const currentPassword = String(formData.get("currentPassword") ?? "");

  if (!isValidPassword(newPassword)) return { error: "Use at least 8 characters for the new password." };
  if (!admin.email) return { error: "Could not verify your current account." };

  const supabase = await createClient();
  const reverifyError = await reverifyCurrentPassword(supabase, admin.email, currentPassword);
  if (reverifyError) return { error: reverifyError };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: "Could not update your password. Please try again." };

  return { message: "Password updated." };
}
