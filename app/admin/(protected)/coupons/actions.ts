"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createCouponForAdmin,
  updateCouponForAdmin,
  setCouponActive,
  deleteCouponForAdmin,
  type CouponInput,
} from "@/lib/repositories/admin/coupons";

export interface CouponFormState {
  error?: string;
  couponId?: string;
}

function toIsoOrNull(value: FormDataEntryValue | null): string | null {
  const str = String(value ?? "").trim();
  return str ? new Date(str).toISOString() : null;
}

export async function saveCouponAction(
  _prevState: CouponFormState,
  formData: FormData
): Promise<CouponFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const code = String(formData.get("code") ?? "").trim();
  const discountType = String(formData.get("discountType") ?? "");
  const discountValue = Number(formData.get("discountValue"));

  if (!code) {
    return { error: "A coupon code is required." };
  }
  if (discountType !== "percentage" && discountType !== "fixed") {
    return { error: "Choose a discount type." };
  }
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return { error: "Enter a valid discount value." };
  }
  if (discountType === "percentage" && discountValue > 100) {
    return { error: "A percentage discount can't exceed 100." };
  }

  const description = String(formData.get("description") ?? "").trim();
  const maxDiscountRaw = String(formData.get("maxDiscountAmount") ?? "").trim();
  const usageLimitRaw = String(formData.get("usageLimit") ?? "").trim();

  const input: CouponInput = {
    code,
    description: description || null,
    discountType,
    discountValue,
    minOrderAmount: Number(formData.get("minOrderAmount") ?? 0) || 0,
    maxDiscountAmount: maxDiscountRaw ? Number(maxDiscountRaw) : null,
    startsAt: toIsoOrNull(formData.get("startsAt")),
    expiresAt: toIsoOrNull(formData.get("expiresAt")),
    usageLimit: usageLimitRaw ? Number(usageLimitRaw) : null,
    isActive: formData.get("isActive") === "on",
  };

  const admin = createAdminClient();

  try {
    const couponId = id ? (await updateCouponForAdmin(admin, id, input), id) : await createCouponForAdmin(admin, input);
    revalidatePath("/admin/coupons");
    return { couponId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    const friendly = message.includes("coupons_code_key")
      ? "That code is already in use by another coupon."
      : "Could not save this coupon. Please check the fields and try again.";
    return { error: friendly };
  }
}

export async function setCouponActiveAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("isActive") === "true";
  if (!id) return;

  const admin = createAdminClient();
  await setCouponActive(admin, id, isActive);
  revalidatePath("/admin/coupons");
}

export async function deleteCouponAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const admin = createAdminClient();
  await deleteCouponForAdmin(admin, id);
  revalidatePath("/admin/coupons");
}
