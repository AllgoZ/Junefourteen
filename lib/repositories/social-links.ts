import { createAnonClient } from "@/lib/supabase/anon";

export interface SocialLinkRow {
  id: string;
  label: string;
  href: string;
}

export async function listActiveSocialLinks(): Promise<SocialLinkRow[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("social_links")
    .select("id, label, href")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .overrideTypes<SocialLinkRow[], { merge: false }>();

  if (error) throw new Error(`listActiveSocialLinks: ${error.message}`);
  return data;
}
