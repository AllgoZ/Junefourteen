"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateOrderStatusForAdmin } from "@/lib/repositories/admin/orders";

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const paymentStatus = String(formData.get("paymentStatus") ?? "");
  if (!id) return;

  const admin = createAdminClient();
  await updateOrderStatusForAdmin(admin, id, { status, paymentStatus });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}
