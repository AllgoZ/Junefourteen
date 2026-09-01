"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getProductsForPricing } from "@/lib/repositories/products";
import { createOrderRequest } from "@/lib/repositories/order-requests";
import { validateMobile, normalizePhone, isValidEmail } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifySession } from "@/lib/auth/dal";
import { linkOrCreateAccountByMobile } from "@/lib/services/auth";

export interface OrderRequestFormState {
  errors?: {
    customerName?: string;
    phone?: string;
    email?: string;
    size?: string;
    quantity?: string;
    deliveryAddress?: string;
    form?: string;
  };
  success?: boolean;
  /** True when submitting this request also signed the browser in (a guest's phone number didn't have an account yet, or already did) — lets the dialog sync the client-side auth flag. */
  signedIn?: boolean;
}

export async function submitOrderRequestAction(
  _prevState: OrderRequestFormState,
  formData: FormData
): Promise<OrderRequestFormState> {
  const productId = String(formData.get("productId") ?? "").trim();
  const customerName = String(formData.get("customerName") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const emailRaw = String(formData.get("email") ?? "").trim();
  const size = String(formData.get("size") ?? "").trim();
  const quantity = Number(formData.get("quantity"));
  const deliveryAddress = String(formData.get("deliveryAddress") ?? "").trim();

  const errors: OrderRequestFormState["errors"] = {};
  if (!customerName) errors.customerName = "Enter your name.";
  const phoneError = validateMobile(phoneRaw);
  if (phoneError) errors.phone = phoneError;
  if (emailRaw && !isValidEmail(emailRaw)) errors.email = "Enter a valid email address.";
  if (!size) errors.size = "Select a size.";
  if (!Number.isInteger(quantity) || quantity <= 0) errors.quantity = "Enter a valid quantity.";
  if (!deliveryAddress) errors.deliveryAddress = "Enter your delivery address.";
  if (Object.keys(errors).length > 0) return { errors };

  const ip = await getClientIp();
  if (!(await checkRateLimit("order-request", ip, { max: 8, windowSeconds: 600 })).allowed) {
    return { errors: { form: "Too many requests. Please wait a few minutes and try again." } };
  }

  const productMap = await getProductsForPricing([productId]);
  const product = productMap.get(productId);
  if (!product || !product.isActive) {
    return { errors: { form: "This product is no longer available." } };
  }
  if (!product.isSoldOut) {
    return { errors: { form: "This product is currently in stock — please use Add to Bag instead." } };
  }

  const phone = normalizePhone(phoneRaw);

  try {
    const user = await verifySession();
    let userId = user?.id ?? null;
    let signedIn = false;

    // Only for a guest — an already-signed-in visitor's session is never
    // touched here, regardless of what phone number they type into the
    // form. This is what "registers the request under an account" for a
    // guest: find (and sign into) the account for this number, or create
    // one, exactly like the mobile signup popup elsewhere on the site.
    if (!userId) {
      const linkResult = await linkOrCreateAccountByMobile(phone);
      if (linkResult.userId) {
        userId = linkResult.userId;
        signedIn = true;
      }
    }

    const admin = createAdminClient();
    await createOrderRequest(admin, {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      userId,
      customerName,
      phone,
      email: emailRaw || null,
      size,
      quantity,
      deliveryAddress,
    });
    return { success: true, signedIn };
  } catch {
    return { errors: { form: "Could not submit your request. Please try again." } };
  }
}
