"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifySession } from "@/lib/auth/dal";
import { getProductsForPricing } from "@/lib/repositories/products";
import { createOrder, type NewOrderItem } from "@/lib/repositories/orders";
import { getOrCreateCartId, clearCartItems } from "@/lib/repositories/cart";
import { createClient } from "@/lib/supabase/server";
import { getShippingEstimate } from "@/lib/services/shipping";
import type { CartItem } from "@/types/cart";

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
  orderNumber?: string;
  error?: string;
}

/**
 * Cart lines come from the client (they own the current cart contents), but
 * every price is re-derived from the live catalog here — the client-supplied
 * `price`/`compareAtPrice` on each line is never read. See backend brief
 * §21: "Never trust client-provided price/subtotal/shipping/discount/total."
 */
export async function createOrderAction(
  cartItems: Pick<CartItem, "productId" | "size" | "sleeve" | "customMeasurements" | "quantity">[],
  address: CheckoutAddressInput
): Promise<CreateOrderResult> {
  if (cartItems.length === 0) {
    return { error: "Your bag is empty." };
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
    orderItems.push({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.imageUrl,
      unitPrice: product.price,
      quantity: line.quantity,
      selectedSize: line.size,
      selectedSleeveOption: line.sleeve,
      customMeasurements: (line.customMeasurements as unknown as NewOrderItem["customMeasurements"]) ?? null,
    });
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = await getShippingEstimate({ country: "India", state: address.state, pin: address.pin });
  const total = subtotal + shipping.amount;

  const user = await verifySession();

  const admin = createAdminClient();
  const { orderNumber } = await createOrder(admin, {
    userId: user?.id ?? null,
    email: address.email,
    phone: address.phone,
    subtotal,
    shippingAmount: shipping.amount,
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

  if (user) {
    const supabase = await createClient();
    const cartId = await getOrCreateCartId(supabase, user.id);
    await clearCartItems(admin, cartId);
  }

  return { orderNumber };
}
