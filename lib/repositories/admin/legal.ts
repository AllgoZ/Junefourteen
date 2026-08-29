import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type LegalPageSlug = "privacy" | "terms";
export type AdminLegalPageRow = Database["public"]["Tables"]["legal_pages"]["Row"];

export async function listLegalPagesForAdmin(admin: SupabaseClient<Database>): Promise<AdminLegalPageRow[]> {
  const { data, error } = await admin.from("legal_pages").select("*").order("slug");
  if (error) throw new Error(`listLegalPagesForAdmin: ${error.message}`);
  return data;
}

export interface LegalPageInput {
  title: string;
  subtitle: string;
  body: string;
}

export async function upsertLegalPageForAdmin(
  admin: SupabaseClient<Database>,
  slug: LegalPageSlug,
  input: LegalPageInput
): Promise<void> {
  const { error } = await admin
    .from("legal_pages")
    .update({ title: input.title, subtitle: input.subtitle, body: input.body })
    .eq("slug", slug);
  if (error) throw new Error(`upsertLegalPageForAdmin: ${error.message}`);
}
