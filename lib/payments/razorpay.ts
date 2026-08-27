import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";

let client: Razorpay | null = null;

/**
 * Lazily constructed, same reasoning as lib/cloudinary/admin.ts's
 * ensureConfigured — reads process.env on first use, not at module load.
 */
function getClient(): Razorpay {
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return client;
}

export interface CreatedRazorpayOrder {
  id: string;
  amount: number;
}

/** amountInRupees is converted to paise (Razorpay's smallest-unit convention) here — callers pass rupees. */
export async function createRazorpayOrder(amountInRupees: number, receipt: string): Promise<CreatedRazorpayOrder> {
  const order = await getClient().orders.create({
    amount: Math.round(amountInRupees * 100),
    currency: "INR",
    receipt,
  });
  return { id: order.id, amount: Number(order.amount) };
}

/**
 * Standard Razorpay Checkout signature check: HMAC-SHA256 of
 * "<razorpay_order_id>|<razorpay_payment_id>" using the key secret, compared
 * to the signature Checkout returned. This is what makes it safe to trust a
 * client-reported "payment succeeded" callback — only Razorpay and this
 * server know the key secret, so a forged callback can't produce a valid
 * signature. Uses a constant-time comparison, not `===`, to avoid a timing
 * side-channel on the check itself.
 */
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signature, "hex");
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, actualBuffer);
}

/**
 * Webhook signature check — a separate scheme from verifyRazorpaySignature
 * above (different secret, different payload shape): Razorpay signs the
 * **raw webhook request body** with a dashboard-configured webhook secret
 * (RAZORPAY_WEBHOOK_SECRET, distinct from RAZORPAY_KEY_SECRET), not the
 * "<order_id>|<payment_id>" string Checkout's client-side callback signs.
 * Callers must pass the untouched raw body text (before any JSON.parse) —
 * the signature is computed over exact bytes, so re-serializing the parsed
 * JSON would silently break verification on the slightest formatting diff.
 */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signature, "hex");
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, actualBuffer);
}
