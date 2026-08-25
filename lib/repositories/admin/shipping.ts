import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type AdminShippingZoneRow = Database["public"]["Tables"]["shipping_zones"]["Row"];

export async function listShippingZonesForAdmin(admin: SupabaseClient<Database>): Promise<AdminShippingZoneRow[]> {
  const { data, error } = await admin.from("shipping_zones").select("*").order("sort_order", { ascending: true });
  if (error) throw new Error(`listShippingZonesForAdmin: ${error.message}`);
  return data;
}

export async function getShippingZoneForAdmin(
  admin: SupabaseClient<Database>,
  id: string
): Promise<AdminShippingZoneRow | null> {
  const { data, error } = await admin.from("shipping_zones").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`getShippingZoneForAdmin: ${error.message}`);
  return data;
}

export interface ShippingZoneInput {
  name: string;
  states: string[];
  rate: number;
  freeShippingThreshold: number | null;
  etaMinDays: number;
  etaMaxDays: number;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
}

function toShippingZoneColumns(input: ShippingZoneInput) {
  return {
    name: input.name,
    states: input.states,
    rate: input.rate,
    free_shipping_threshold: input.freeShippingThreshold,
    eta_min_days: input.etaMinDays,
    eta_max_days: input.etaMaxDays,
    is_default: input.isDefault,
    sort_order: input.sortOrder,
    is_active: input.isActive,
  };
}

/** Only one zone can be the default at a time — same single-default-at-a-time pattern as addAddress. */
async function clearOtherDefaults(admin: SupabaseClient<Database>, exceptId?: string): Promise<void> {
  let query = admin.from("shipping_zones").update({ is_default: false });
  if (exceptId) query = query.neq("id", exceptId);
  await query.eq("is_default", true);
}

export async function createShippingZoneForAdmin(
  admin: SupabaseClient<Database>,
  input: ShippingZoneInput
): Promise<string> {
  if (input.isDefault) await clearOtherDefaults(admin);
  const { data, error } = await admin.from("shipping_zones").insert(toShippingZoneColumns(input)).select("id").single();
  if (error || !data) throw new Error(`createShippingZoneForAdmin: ${error?.message}`);
  return data.id;
}

export async function updateShippingZoneForAdmin(
  admin: SupabaseClient<Database>,
  id: string,
  input: ShippingZoneInput
): Promise<void> {
  if (input.isDefault) await clearOtherDefaults(admin, id);
  const { error } = await admin.from("shipping_zones").update(toShippingZoneColumns(input)).eq("id", id);
  if (error) throw new Error(`updateShippingZoneForAdmin: ${error.message}`);
}

export async function setShippingZoneActive(
  admin: SupabaseClient<Database>,
  id: string,
  isActive: boolean
): Promise<void> {
  const { error } = await admin.from("shipping_zones").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(`setShippingZoneActive: ${error.message}`);
}

/** Real delete — nothing else references a shipping zone by FK (same reasoning as banners). */
export async function deleteShippingZoneForAdmin(admin: SupabaseClient<Database>, id: string): Promise<void> {
  const { error } = await admin.from("shipping_zones").delete().eq("id", id);
  if (error) throw new Error(`deleteShippingZoneForAdmin: ${error.message}`);
}
