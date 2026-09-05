import { createAdminClient } from "@/lib/supabase/admin";
import { getOrderForAdmin, type AdminOrderRow } from "@/lib/repositories/admin/orders";
import { sendEmail } from "@/lib/email/resend";
import { newOrderAdminEmailHtml, orderTrackingEmailHtml, orderShippedEmailHtml } from "@/lib/email/templates";
import { site } from "@/lib/config/site";

/**
 * Fired once, when an order's payment is confirmed (see the two call sites:
 * verifyRazorpayPaymentAction and the Razorpay webhook — whichever reaches
 * "paid" first for a given order). Re-fetches the order + items itself so
 * the two call sites don't need to assemble the full email payload.
 */
export async function notifyAdminOfNewOrder(orderId: string): Promise<void> {
  try {
    const admin = createAdminClient();
    const result = await getOrderForAdmin(admin, orderId);
    if (!result) return;

    await sendEmail({
      to: site.contactEmail,
      subject: `New order ${result.order.order_number}`,
      html: newOrderAdminEmailHtml(result.order, result.items),
    });
  } catch (err) {
    console.error("notifyAdminOfNewOrder failed", orderId, err);
  }
}

/** Fired when an admin adds/changes an order's tracking number or URL. Caller passes the already-updated order. */
export async function notifyCustomerOfTracking(order: AdminOrderRow): Promise<void> {
  try {
    await sendEmail({
      to: order.email,
      subject: `Tracking added for your order ${order.order_number}`,
      html: orderTrackingEmailHtml(order),
    });
  } catch (err) {
    console.error("notifyCustomerOfTracking failed", order.id, err);
  }
}

/** Fired when an admin changes an order's status to "shipped". Caller passes the already-updated order. */
export async function notifyCustomerOfShipped(order: AdminOrderRow): Promise<void> {
  try {
    await sendEmail({
      to: order.email,
      subject: `Your order ${order.order_number} has shipped`,
      html: orderShippedEmailHtml(order),
    });
  } catch (err) {
    console.error("notifyCustomerOfShipped failed", order.id, err);
  }
}
