import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ActiveTaxRate {
  ratePercent: number;
  label: string;
}

async function fetchActiveTaxRate(): Promise<ActiveTaxRate | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("tax_settings").select("rate_percent, label, is_active").eq("id", true).single();
  if (error || !data || !data.is_active || data.rate_percent <= 0) return null;
  return { ratePercent: data.rate_percent, label: data.label };
}

/** null when tax is off (the default) — every existing order/checkout keeps computing exactly $0 tax. */
export const getActiveTaxRate = unstable_cache(fetchActiveTaxRate, ["tax-settings"], {
  tags: ["tax-settings"],
  revalidate: 3600,
});
