import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type AdminTaxSettingsRow = Database["public"]["Tables"]["tax_settings"]["Row"];

export async function getTaxSettingsForAdmin(admin: SupabaseClient<Database>): Promise<AdminTaxSettingsRow> {
  const { data, error } = await admin.from("tax_settings").select("*").eq("id", true).single();
  if (error || !data) throw new Error(`getTaxSettingsForAdmin: ${error?.message}`);
  return data;
}

export interface TaxSettingsInput {
  ratePercent: number;
  label: string;
  isActive: boolean;
}

export async function upsertTaxSettingsForAdmin(
  admin: SupabaseClient<Database>,
  input: TaxSettingsInput
): Promise<void> {
  const { error } = await admin
    .from("tax_settings")
    .update({ rate_percent: input.ratePercent, label: input.label, is_active: input.isActive })
    .eq("id", true);
  if (error) throw new Error(`upsertTaxSettingsForAdmin: ${error.message}`);
}
