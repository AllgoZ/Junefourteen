import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type AdminSocialLinkRow = Database["public"]["Tables"]["social_links"]["Row"];

export async function listAllSocialLinksForAdmin(admin: SupabaseClient<Database>): Promise<AdminSocialLinkRow[]> {
  const { data, error } = await admin.from("social_links").select("*").order("sort_order", { ascending: true });
  if (error) throw new Error(`listAllSocialLinksForAdmin: ${error.message}`);
  return data;
}

export interface SocialLinkInput {
  label: string;
  href: string;
  isActive: boolean;
}

/**
 * Full replace-all-on-save, mirroring replaceProductRelations' delete-then-
 * reinsert convention — there's no per-row identity worth preserving for a
 * handful of footer links edited as one list.
 */
export async function replaceSocialLinks(admin: SupabaseClient<Database>, links: SocialLinkInput[]): Promise<void> {
  await admin.from("social_links").delete().not("id", "is", null);
  if (links.length === 0) return;

  const { error } = await admin.from("social_links").insert(
    links.map((link, index) => ({
      label: link.label,
      href: link.href,
      sort_order: index,
      is_active: link.isActive,
    }))
  );
  if (error) throw new Error(`replaceSocialLinks: ${error.message}`);
}
