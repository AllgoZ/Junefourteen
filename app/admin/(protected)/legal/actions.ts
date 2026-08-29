"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { upsertLegalPageForAdmin, type LegalPageSlug } from "@/lib/repositories/admin/legal";

export interface LegalPageFormState {
  error?: string;
  success?: boolean;
}

const VALID_SLUGS: LegalPageSlug[] = ["privacy", "terms"];

export async function saveLegalPageAction(
  _prevState: LegalPageFormState,
  formData: FormData
): Promise<LegalPageFormState> {
  await requireAdmin();

  const slug = String(formData.get("slug") ?? "") as LegalPageSlug;
  if (!VALID_SLUGS.includes(slug)) {
    return { error: "Unknown page." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) {
    return { error: "Title and body are both required." };
  }
  const subtitle = String(formData.get("subtitle") ?? "").trim();

  const admin = createAdminClient();

  try {
    await upsertLegalPageForAdmin(admin, slug, { title, subtitle, body });
    revalidateTag(`legal-page:${slug}`, "max");
    revalidatePath("/admin/legal");
    revalidatePath(`/${slug}`);
    return { success: true };
  } catch {
    return { error: "Could not save this page. Please try again." };
  }
}
