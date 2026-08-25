import { createAdminClient } from "@/lib/supabase/admin";

export interface ValidCoupon {
  valid: true;
  couponId: string;
  code: string;
  discountAmount: number;
}

export interface InvalidCoupon {
  valid: false;
  error: string;
}

/**
 * Never cached — usage count/expiry must be checked fresh every call.
 * Used both for the checkout "Apply" preview (applyCouponAction) and,
 * authoritatively, inside createOrderAction — the client-computed discount
 * from the preview call is never trusted for the actual order total, same
 * "server-computed pricing" rule this codebase already applies to every
 * line item.
 */
export async function validateCoupon(rawCode: string, subtotal: number): Promise<ValidCoupon | InvalidCoupon> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { valid: false, error: "Enter a coupon code." };

  const admin = createAdminClient();
  const { data: coupon, error } = await admin.from("coupons").select("*").eq("code", code).maybeSingle();
  if (error) return { valid: false, error: "Could not check that code. Please try again." };
  if (!coupon || !coupon.is_active) return { valid: false, error: "This coupon code isn't valid." };

  const now = Date.now();
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
    return { valid: false, error: "This coupon isn't active yet." };
  }
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) {
    return { valid: false, error: "This coupon has expired." };
  }
  if (coupon.usage_limit != null && coupon.times_used >= coupon.usage_limit) {
    return { valid: false, error: "This coupon has reached its usage limit." };
  }
  if (subtotal < coupon.min_order_amount) {
    return { valid: false, error: `This coupon needs a minimum order of ₹${coupon.min_order_amount}.` };
  }

  let discountAmount =
    coupon.discount_type === "percentage" ? (subtotal * coupon.discount_value) / 100 : coupon.discount_value;

  if (coupon.max_discount_amount != null) {
    discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
  }
  // A discount can never make the order negative, regardless of coupon config.
  discountAmount = Math.min(discountAmount, subtotal);
  discountAmount = Math.round(discountAmount * 100) / 100;

  return { valid: true, couponId: coupon.id, code: coupon.code, discountAmount };
}

export async function recordCouponUsage(couponId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: coupon } = await admin.from("coupons").select("times_used").eq("id", couponId).maybeSingle();
  if (!coupon) return;
  await admin.from("coupons").update({ times_used: coupon.times_used + 1 }).eq("id", couponId);
}
