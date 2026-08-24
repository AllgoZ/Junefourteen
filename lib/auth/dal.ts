import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * getUser() (not getSession()) — validates the JWT against Supabase Auth
 * rather than trusting the cookie's claims unverified. Memoized with React's
 * cache() so multiple call sites in one render pass share a single request.
 */
export const verifySession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await verifySession();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
});

/** For pages/actions that require a signed-in customer. */
export async function requireUser() {
  const user = await verifySession();
  if (!user) redirect("/account");
  return user;
}

/**
 * For admin pages/actions. proxy.ts already blocks unauthenticated/non-admin
 * requests to /admin/*, but every admin server action re-checks here too —
 * actions are reachable by direct POST, not just through the gated UI (see
 * the backend brief's §9 "not just hiding links" instruction).
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/admin/login");
  }
  return profile;
}
