import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type AdminCouponRow = Database["public"]["Tables"]["coupons"]["Row"];

export async function listAllCouponsForAdmin(admin: SupabaseClient<Database>): Promise<AdminCouponRow[]> {
  const { data, error } = await admin.from("coupons").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(`listAllCouponsForAdmin: ${error.message}`);
  return data;
}

export async function getCouponForAdmin(
  admin: SupabaseClient<Database>,
  id: string
): Promise<AdminCouponRow | null> {
  const { data, error } = await admin.from("coupons").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`getCouponForAdmin: ${error.message}`);
  return data;
}

export interface CouponInput {
  code: string;
  description: string | null;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  usageLimit: number | null;
  isActive: boolean;
}

function toCouponColumns(input: CouponInput) {
  return {
    code: input.code.trim().toUpperCase(),
    description: input.description,
    discount_type: input.discountType,
    discount_value: input.discountValue,
    min_order_amount: input.minOrderAmount,
    max_discount_amount: input.maxDiscountAmount,
    starts_at: input.startsAt,
    expires_at: input.expiresAt,
    usage_limit: input.usageLimit,
    is_active: input.isActive,
  };
}

export async function createCouponForAdmin(admin: SupabaseClient<Database>, input: CouponInput): Promise<string> {
  const { data, error } = await admin.from("coupons").insert(toCouponColumns(input)).select("id").single();
  if (error || !data) throw new Error(`createCouponForAdmin: ${error?.message}`);
  return data.id;
}

export async function updateCouponForAdmin(
  admin: SupabaseClient<Database>,
  id: string,
  input: CouponInput
): Promise<void> {
  const { error } = await admin.from("coupons").update(toCouponColumns(input)).eq("id", id);
  if (error) throw new Error(`updateCouponForAdmin: ${error.message}`);
}

export async function setCouponActive(
  admin: SupabaseClient<Database>,
  id: string,
  isActive: boolean
): Promise<void> {
  const { error } = await admin.from("coupons").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(`setCouponActive: ${error.message}`);
}

/** Real delete — nothing else references a coupon by FK (an order snapshots the code as plain text on orders.coupon_code, not an FK). */
export async function deleteCouponForAdmin(admin: SupabaseClient<Database>, id: string): Promise<void> {
  const { error } = await admin.from("coupons").delete().eq("id", id);
  if (error) throw new Error(`deleteCouponForAdmin: ${error.message}`);
}
