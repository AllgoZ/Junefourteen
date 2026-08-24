"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { replaceSocialLinks, type SocialLinkInput } from "@/lib/repositories/admin/social-links";

export interface SocialLinksFormState {
  error?: string;
  success?: boolean;
}

export async function saveSocialLinksAction(
  _prevState: SocialLinksFormState,
  formData: FormData
): Promise<SocialLinksFormState> {
  await requireAdmin();

  const labels = formData.getAll("label").map(String);
  const hrefs = formData.getAll("href").map(String);

  const links: SocialLinkInput[] = labels
    .map((label, i) => ({ label: label.trim(), href: (hrefs[i] ?? "").trim(), isActive: true }))
    .filter((link) => link.label && link.href);

  const admin = createAdminClient();

  try {
    await replaceSocialLinks(admin, links);
    revalidateTag("social-links", "max");
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Could not save social links. Please check the fields and try again." };
  }
}
