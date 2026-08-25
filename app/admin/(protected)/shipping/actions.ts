"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createShippingZoneForAdmin,
  updateShippingZoneForAdmin,
  setShippingZoneActive,
  deleteShippingZoneForAdmin,
  type ShippingZoneInput,
} from "@/lib/repositories/admin/shipping";

export interface ShippingZoneFormState {
  error?: string;
  zoneId?: string;
}

export async function saveShippingZoneAction(
  _prevState: ShippingZoneFormState,
  formData: FormData
): Promise<ShippingZoneFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const name = String(formData.get("name") ?? "").trim();
  const rate = Number(formData.get("rate"));
  const etaMinDays = Number(formData.get("etaMinDays"));
  const etaMaxDays = Number(formData.get("etaMaxDays"));
  const freeShippingThresholdRaw = String(formData.get("freeShippingThreshold") ?? "").trim();

  if (!name || !Number.isFinite(rate) || rate < 0) {
    return { error: "Name and a valid rate are required." };
  }
  if (!Number.isInteger(etaMinDays) || !Number.isInteger(etaMaxDays) || etaMinDays < 0 || etaMaxDays < etaMinDays) {
    return { error: "Enter a valid delivery estimate (min days ≤ max days)." };
  }

  const input: ShippingZoneInput = {
    name,
    states: formData.getAll("states").map(String),
    rate,
    freeShippingThreshold: freeShippingThresholdRaw ? Number(freeShippingThresholdRaw) : null,
    etaMinDays,
    etaMaxDays,
    isDefault: formData.get("isDefault") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
    isActive: formData.get("isActive") === "on",
  };

  const admin = createAdminClient();

  try {
    const zoneId = id ? (await updateShippingZoneForAdmin(admin, id, input), id) : await createShippingZoneForAdmin(admin, input);

    revalidateTag("shipping-zones", "max");
    revalidatePath("/admin/shipping");

    return { zoneId };
  } catch {
    return { error: "Could not save this shipping zone. Please check the fields and try again." };
  }
}

export async function setShippingZoneActiveAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("isActive") === "true";
  if (!id) return;

  const admin = createAdminClient();
  await setShippingZoneActive(admin, id, isActive);
  revalidateTag("shipping-zones", "max");
  revalidatePath("/admin/shipping");
}

export async function deleteShippingZoneAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const admin = createAdminClient();
  await deleteShippingZoneForAdmin(admin, id);
  revalidateTag("shipping-zones", "max");
  revalidatePath("/admin/shipping");
}
