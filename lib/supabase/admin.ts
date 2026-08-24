import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Service-role client — bypasses RLS entirely. Only for code paths that have
 * already verified the caller is authorized (see lib/auth/dal.ts#requireAdmin,
 * or the order-creation action which computes its own authoritative pricing).
 * The `server-only` import makes any accidental client-bundle import a build
 * error instead of a leaked secret.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
