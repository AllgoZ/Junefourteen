import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Plain anonymous client — no cookies, no session, safe to call from inside
 * unstable_cache (which forbids request-scoped APIs like cookies() in its
 * callback). Use for public, cacheable reads only (catalog/search); RLS
 * still applies, scoped to what the `is_active = true` public-read policies
 * allow — see supabase/migrations/0003_rls.sql.
 */
export function createAnonClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
