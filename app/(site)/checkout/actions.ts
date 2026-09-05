"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifySession } from "@/lib/auth/dal";
import { getProductsForPricing } from "@/lib/repositories/products";
import { createOrder, setOrderRazorpayOrderId, markOrderPaid, type NewOrderItem } from "@/lib/repositories/orders";
import { getOrCreateCartId, clearCartItems } from "@/lib/repositories/cart";
import { createClient } from "@/lib/supabase/server";
import { getShippingEstimate } from "@/lib/services/shipping";
import { listAddressesForUser, createAddressForUser } from "@/lib/repositories/addresses";
import { createRazorpayOrder, verifyRazorpaySignature } from "@/lib/payments/razorpay";
import { getActiveTaxRate } from "@/lib/services/tax";
import { validateCoupon, recordCouponUsage } from "@/lib/services/coupons";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { notifyAdminOfNewOrder } from "@/lib/email/order-notifications";
import type { CartItem } from "@/types/cart";
import type { ShippingEstimateInput, ShippingEstimateResult } from "@/types/shipping";

/**
 * Thin Server Action wrapper — getShippingEstimate now does a real DB read
 * (lib/services/shipping.ts), so it can no longer be called directly from
 * the client component the way the old pure-constants version could be.
 */
export async function estimateShippingAction(input: ShippingEstimateInput): Promise<ShippingEstimateResult> {
  return getShippingEstimate(input);
}

export interface ApplyCouponResult {
  discountAmount?: number;
  code?: string;
  error?: string;
}

/** Preview only — createOrderAction re-validates from scratch and is the only call that actually counts. */
export async function applyCouponAction(code: string, subtotal: number): Promise<ApplyCouponResult> {
  const ip = await getClientIp();
  if (!(await checkRateLimit("coupon-apply", ip, { max: 20, windowSeconds: 600 })).allowed) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const result = await validateCoupon(code, subtotal);
  if (!result.valid) return { error: result.error };
  return { discountAmount: result.discountAmount, code: result.code };
}

export interface CheckoutAddressInput {
  email: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pin: string;
}

export interface CreateOrderResult {
  orderId?: string;
  orderNumber?: string;
  razorpayOrderId?: string;
  razorpayKeyId?: string;
  /** Paise — what Checkout expects, already the exact amount the Razorpay order was created for. */
  amount?: number;
  error?: string;
}

/**
 * Cart lines come from the client (they own the current cart contents), but
 * every price is re-derived from the live catalog here — the client-supplied
 * `price`/`compareAtPrice` on each line is never read. See backend brief
 * §21: "Never trust client-provided price/subtotal/shipping/discount/total."
 *
 * Creates the order (status/payment_status both start "pending", matching
 * the schema default) and a matching Razorpay order, but does **not** clear
 * the cart yet — that only happens once verifyRazorpayPaymentAction confirms
 * a genuinely signed payment, so an abandoned/failed payment leaves the
 * cart intact for a retry.
 */
export async function createOrderAction(
  cartItems: Pick<
    CartItem,
    "productId" | "size" | "sleeve" | "customMeasurements" | "selectedPieceIds" | "quantity"
  >[],
  address: CheckoutAddressInput,
  options: { saveAddress?: boolean; couponCode?: string } = {}
): Promise<CreateOrderResult> {
  if (cartItems.length === 0) {
    return { error: "Your bag is empty." };
  }

  const ip = await getClientIp();
  if (!(await checkRateLimit("order-create", ip, { max: 10, windowSeconds: 600 })).allowed) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  if (
    !address.email ||
    !address.fullName ||
    !address.phone ||
    !address.addressLine1 ||
    !address.city ||
    !address.state ||
    !/^\d{6}$/.test(address.pin)
  ) {
    return { error: "Please complete your contact and shipping details." };
  }
  if (cartItems.some((item) => !Number.isInteger(item.quantity) || item.quantity <= 0)) {
    return { error: "Invalid quantity in your bag." };
  }

  const productMap = await getProductsForPricing(cartItems.map((item) => item.productId));

  const orderItems: NewOrderItem[] = [];
  for (const line of cartItems) {
    const product = productMap.get(line.productId);
    if (!product || !product.isActive) {
      return { error: "One of the items in your bag is no longer available. Please review your bag." };
    }
    if (product.isSoldOut) {
      return { error: `${product.name} just sold out. Please remove it from your bag.` };
    }

    // Per-piece product: the charged unit price is the server-side sum of the
    // selected pieces — the client-supplied line price is never read (backend
    // brief §21).
    let unitPrice = product.price;
    let selectedPieces: string | null = null;
    if (product.pieces.length > 0) {
      const activeById = new Map(product.pieces.filter((p) => p.isActive).map((p) => [p.id, p]));
      const chosen = (line.selectedPieceIds ?? []).map((id) => activeById.get(id));
      if (chosen.length === 0 || chosen.some((p) => !p)) {
        return { error: `Please re-select the pieces for ${product.name} in your bag.` };
      }
      const chosenPieces = (chosen as NonNullable<(typeof chosen)[number]>[]).sort(
        (a, b) => a.sortOrder - b.sortOrder
      );
      unitPrice = chosenPieces.reduce((sum, p) => sum + p.price, 0);
      selectedPieces = chosenPieces.map((p) => p.name).join(" + ");
    }

    orderItems.push({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.imageUrl,
      unitPrice,
      quantity: line.quantity,
      selectedSize: line.size,
      selectedSleeveOption: line.sleeve,
      customMeasurements: (line.customMeasurements as unknown as NewOrderItem["customMeasurements"]) ?? null,
      selectedPieces,
    });
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = await getShippingEstimate({ country: "India", state: address.state, pin: address.pin, orderSubtotal: subtotal });

  let discountAmount = 0;
  let appliedCoupon: { couponId: string; code: string } | null = null;
  if (options.couponCode) {
    const couponResult = await validateCoupon(options.couponCode, subtotal);
    if (!couponResult.valid) {
      return { error: couponResult.error };
    }
    discountAmount = couponResult.discountAmount;
    appliedCoupon = { couponId: couponResult.couponId, code: couponResult.code };
  }

  const taxRate = await getActiveTaxRate();
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxRate ? Math.round(taxableAmount * (taxRate.ratePercent / 100) * 100) / 100 : 0;

  const total = subtotal - discountAmount + shipping.amount + taxAmount;

  const user = await verifySession();

  const admin = createAdminClient();
  const { id: orderId, orderNumber } = await createOrder(admin, {
    userId: user?.id ?? null,
    email: address.email,
    phone: address.phone,
    subtotal,
    shippingAmount: shipping.amount,
    discountAmount,
    taxAmount,
    couponCode: appliedCoupon?.code ?? null,
    total,
    shippingAddress: {
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || null,
      city: address.city,
      state: address.state,
      pin: address.pin,
      country: "India",
    },
    items: orderItems,
  });

  if (appliedCoupon) {
    await recordCouponUsage(appliedCoupon.couponId);
  }

  if (user && options.saveAddress) {
    // Best-effort: the order is already placed at this point, so a failure
    // here shouldn't block checkout from continuing to payment.
    try {
      const existing = await listAddressesForUser(admin, user.id);
      await createAddressForUser(
        admin,
        user.id,
        {
          fullName: address.fullName,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || null,
          city: address.city,
          state: address.state,
          postalCode: address.pin,
        },
        existing.length === 0
      );
    } catch {
      // ignored — see comment above
    }
  }

  try {
    const razorpayOrder = await createRazorpayOrder(total, orderNumber);
    await setOrderRazorpayOrderId(admin, orderId, razorpayOrder.id);
    return {
      orderId,
      orderNumber,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
    };
  } catch (err) {
    // The order row already exists (status "pending") — an admin can see it
    // and the customer can be told to retry; nothing to roll back. Logged
    // server-side (never in the client-facing error) so a real cause —
    // e.g. Razorpay's own API rejecting the key_id/key_secret pair with a
    // 401, which this exact catch block was previously swallowing
    // silently — is diagnosable from server logs instead of requiring a
    // one-off script to re-discover it.
    console.error("createOrderAction: Razorpay order creation failed", err);
    return { error: "Could not start payment. Please try again." };
  }
}

export interface VerifyPaymentInput {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResult {
  orderNumber?: string;
  error?: string;
}

/**
 * The only place an order is ever marked paid. Verifies the HMAC signature
 * Razorpay Checkout returned (lib/payments/razorpay.ts) before touching
 * anything — a client that reports success without a valid signature is
 * rejected, not trusted.
 */
export async function verifyRazorpayPaymentAction(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
  const valid = verifyRazorpaySignature(input.razorpayOrderId, input.razorpayPaymentId, input.razorpaySignature);
  if (!valid) {
    return { error: "Payment verification failed. If money was deducted, it will be refunded automatically." };
  }

  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id, order_number, user_id, razorpay_order_id, payment_status")
    .eq("id", input.orderId)
    .maybeSingle();

  if (orderError || !order || order.razorpay_order_id !== input.razorpayOrderId) {
    return { error: "Could not confirm this order. Please contact support if you were charged." };
  }

  const wasAlreadyPaid = order.payment_status === "paid";
  await markOrderPaid(admin, order.id, input.razorpayPaymentId);

  if (!wasAlreadyPaid) {
    // Best-effort — never blocks payment confirmation from returning to the customer.
    await notifyAdminOfNewOrder(order.id);
  }

  if (order.user_id) {
    const supabase = await createClient();
    const cartId = await getOrCreateCartId(supabase, order.user_id);
    await clearCartItems(admin, cartId);
  }

  return { orderNumber: order.order_number };
}
