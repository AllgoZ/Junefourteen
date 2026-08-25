"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateOrderStatusForAdmin, updateOrderTrackingForAdmin } from "@/lib/repositories/admin/orders";

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

export async function updateOrderTrackingAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  const trackingUrl = String(formData.get("trackingUrl") ?? "").trim();

  const admin = createAdminClient();
  await updateOrderTrackingForAdmin(admin, id, {
    trackingNumber: trackingNumber || null,
    trackingUrl: trackingUrl || null,
  });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}
