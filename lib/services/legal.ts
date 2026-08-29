import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LegalPageSlug } from "@/lib/repositories/admin/legal";

export interface LegalPageContent {
  title: string;
  subtitle: string;
  body: string;
}

/** null falls back to the page's original hardcoded copy — /privacy and /terms never break. */
export async function getLegalPage(slug: LegalPageSlug): Promise<LegalPageContent | null> {
  const cached = unstable_cache(
    async (s: LegalPageSlug) => {
      const admin = createAdminClient();
      const { data, error } = await admin.from("legal_pages").select("title, subtitle, body").eq("slug", s).single();
      return error || !data ? null : data;
    },
    ["legal-page-by-slug"],
    { tags: [`legal-page:${slug}`], revalidate: 3600 }
  );
  return cached(slug);
}
