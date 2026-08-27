import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay";
import { markOrderPaid } from "@/lib/repositories/orders";

interface RazorpayPaymentEntity {
  id: string;
  order_id: string;
}

/**
 * Both `payment.captured` and `order.paid` carry the payment entity at
 * payload.payment.entity — checked loosely (not a full schema) since this
 * only ever reads two string fields and a malformed/unexpected shape should
 * fall through to "ignore this event," never throw.
 */
function extractPayment(event: unknown): RazorpayPaymentEntity | null {
  if (typeof event !== "object" || event === null) return null;
  const payload = (event as { payload?: unknown }).payload;
  if (typeof payload !== "object" || payload === null) return null;
  const payment = (payload as { payment?: unknown }).payment;
  if (typeof payment !== "object" || payment === null) return null;
  const entity = (payment as { entity?: unknown }).entity;
  if (typeof entity !== "object" || entity === null) return null;

  const { id, order_id } = entity as Record<string, unknown>;
  if (typeof id !== "string" || typeof order_id !== "string") return null;
  return { id, order_id };
}

/**
 * Second, authoritative payment-confirmation path — reconciles orders that
 * the browser-side flow (verifyRazorpayPaymentAction, app/(site)/checkout/
 * actions.ts) never got to confirm: tab closed, network dropped, or a JS
 * error after Razorpay actually captured the money. That client-side path
 * is untouched and still the immediate-UX confirmation; this is the
 * safety net behind it, not a replacement.
 *
 * Never trusts the payload before the signature is verified against the
 * raw body — no DB read happens on an unverified request.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "Could not read request body" }, { status: 400 });
  }

  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payment = extractPayment(event);
  if (!payment) {
    // An event type this app doesn't act on (e.g. payment.failed) — 200 so
    // Razorpay doesn't keep retrying an event we're deliberately ignoring.
    return NextResponse.json({ received: true });
  }

  try {
    const admin = createAdminClient();
    const { data: order, error } = await admin
      .from("orders")
      .select("id, payment_status")
      .eq("razorpay_order_id", payment.order_id)
      .maybeSingle();

    if (error) {
      // Transient DB trouble — a non-2xx tells Razorpay to retry later,
      // which is what we want for a genuine infra hiccup.
      console.error("razorpay webhook: order lookup failed", error.message);
      return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
    }

    if (!order) {
      // No matching order (e.g. a test-mode event against different data) —
      // nothing to reconcile, and retrying won't change that.
      return NextResponse.json({ received: true });
    }

    // Idempotent: a retried webhook, or one that races the client-side
    // confirmation path, is a no-op rather than a duplicate transition.
    if (order.payment_status !== "paid") {
      await markOrderPaid(admin, order.id, payment.id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("razorpay webhook: unexpected error", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
