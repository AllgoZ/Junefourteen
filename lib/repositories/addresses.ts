import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type AddressRow = Database["public"]["Tables"]["addresses"]["Row"];

/** Caller-scoped: pass the cookie-bound server client so RLS enforces "own rows only". */
export async function listAddressesForUser(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<AddressRow[]> {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`listAddressesForUser: ${error.message}`);
  return data;
}
