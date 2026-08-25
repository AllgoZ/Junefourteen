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

export interface NewAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
}

/**
 * Same insert shape as the "Add Address" form in lib/services/addresses.ts's
 * addAddress — extracted here so checkout can save the address it just used
 * without depending on that action's FormData-shaped, "use server" contract.
 * Caller decides `isDefault` (checkout makes a user's first saved address
 * their default, matching AddressesPanel's own "first address" UX, and
 * never auto-overrides an existing default).
 */
export async function createAddressForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: NewAddress,
  isDefault: boolean
): Promise<void> {
  const { error } = await supabase.from("addresses").insert({
    user_id: userId,
    full_name: input.fullName,
    phone: input.phone,
    address_line_1: input.addressLine1,
    address_line_2: input.addressLine2,
    city: input.city,
    state: input.state,
    postal_code: input.postalCode,
    is_default: isDefault,
  });
  if (error) throw new Error(`createAddressForUser: ${error.message}`);
}
