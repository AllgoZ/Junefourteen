"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrderForAdmin, updateOrderStatusForAdmin, updateOrderTrackingForAdmin } from "@/lib/repositories/admin/orders";
import { notifyCustomerOfShipped, notifyCustomerOfTracking } from "@/lib/email/order-notifications";

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const paymentStatus = String(formData.get("paymentStatus") ?? "");
  if (!id) return;

  const admin = createAdminClient();
  const existing = await getOrderForAdmin(admin, id);
  await updateOrderStatusForAdmin(admin, id, { status, paymentStatus });

  if (existing && status === "shipped" && existing.order.status !== "shipped") {
    // Best-effort — never blocks the status update from completing.
    await notifyCustomerOfShipped({ ...existing.order, status });
  }

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
  const existing = await getOrderForAdmin(admin, id);
  await updateOrderTrackingForAdmin(admin, id, {
    trackingNumber: trackingNumber || null,
    trackingUrl: trackingUrl || null,
  });

  const hasNewTracking = Boolean(trackingNumber || trackingUrl);
  const trackingChanged =
    existing &&
    (existing.order.tracking_number !== (trackingNumber || null) || existing.order.tracking_url !== (trackingUrl || null));
  if (existing && hasNewTracking && trackingChanged) {
    // Best-effort — never blocks the tracking update from completing.
    await notifyCustomerOfTracking({
      ...existing.order,
      tracking_number: trackingNumber || null,
      tracking_url: trackingUrl || null,
    });
  }

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}
