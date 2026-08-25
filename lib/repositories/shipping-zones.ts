import { createAdminClient } from "@/lib/supabase/admin";

export interface ShippingZoneRow {
  id: string;
  states: string[];
  rate: number;
  free_shipping_threshold: number | null;
  eta_min_days: number;
  eta_max_days: number;
  is_default: boolean;
}

const ZONE_SELECT = "id, states, rate, free_shipping_threshold, eta_min_days, eta_max_days, is_default";

/**
 * Server-only (via the service-role client, not the anon one) — unlike
 * products/collections/banners, shipping_zones has no public-read RLS
 * policy at all, because the only reader is getShippingEstimate, which now
 * has to run behind a Server Action (estimateShippingAction in
 * app/(site)/checkout/actions.ts) rather than being called directly from
 * the client component the way the old static rate table was — a real DB
 * read can't safely happen in browser-bundled code the way pure constants
 * could.
 */
export async function listActiveShippingZones(): Promise<ShippingZoneRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("shipping_zones")
    .select(ZONE_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`listActiveShippingZones: ${error.message}`);
  return data;
}
