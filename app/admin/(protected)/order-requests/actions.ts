"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateOrderRequestStatusForAdmin } from "@/lib/repositories/admin/order-requests";

export async function updateOrderRequestStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !status) return;

  const admin = createAdminClient();
  await updateOrderRequestStatusForAdmin(admin, id, status);
  revalidatePath("/admin/order-requests");
}
