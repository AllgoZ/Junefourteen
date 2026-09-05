import { formatPrice } from "@/lib/format";
import type { AdminOrderRow, AdminOrderItemRow } from "@/lib/repositories/admin/orders";
import type { Json } from "@/lib/supabase/types";

/** Used only to build links back to the site inside transactional emails — see ARCHITECTURE.md's email section for why this isn't lib/config/site.ts's `url`. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.junefourteen.in";

/** Every value below can originate from customer/admin-entered text (name, address, tracking number, …) — escape before interpolating into raw HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pin: string;
  country: string;
}

/** Same shape assumed by app/admin/(protected)/orders/[id]/page.tsx's AddressBlock. */
function parseShippingAddress(json: Json): ShippingAddress | null {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null;
  const a = json as Record<string, string | null>;
  return {
    fullName: a.fullName ?? "",
    phone: a.phone ?? "",
    addressLine1: a.addressLine1 ?? "",
    addressLine2: a.addressLine2 ?? null,
    city: a.city ?? "",
    state: a.state ?? "",
    pin: a.pin ?? "",
    country: a.country ?? "",
  };
}

function addressHtml(json: Json): string {
  const a = parseShippingAddress(json);
  if (!a) return "";
  return `
    <p style="margin:0;font-weight:600;">${escapeHtml(a.fullName)}</p>
    <p style="margin:0;">${escapeHtml(a.phone)}</p>
    <p style="margin:0;">${escapeHtml(a.addressLine1)}${a.addressLine2 ? `, ${escapeHtml(a.addressLine2)}` : ""}</p>
    <p style="margin:0;">${escapeHtml(a.city)}, ${escapeHtml(a.state)} ${escapeHtml(a.pin)}</p>
    <p style="margin:0;">${escapeHtml(a.country)}</p>
  `;
}

const WRAPPER_STYLE =
  "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0A0A0A;max-width:600px;margin:0 auto;padding:24px;";
const HEADING_STYLE = "font-size:18px;font-weight:600;margin:0 0 16px;";
const CARD_STYLE = "border:1px solid #E7E5E2;border-radius:12px;padding:16px;margin:0 0 16px;";
const LABEL_STYLE = "font-size:12px;letter-spacing:0.05em;text-transform:uppercase;color:#6B6B6B;margin:0 0 6px;";
const LINK_BUTTON_STYLE =
  "display:inline-block;background:#0A0A0A;color:#FFFFFF;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;margin-top:8px;";

function itemLineDescription(item: AdminOrderItemRow): string {
  const parts: string[] = [];
  if (item.selected_pieces) parts.push(item.selected_pieces);
  if (item.selected_size) parts.push(`Size ${item.selected_size}`);
  if (item.selected_sleeve_option) parts.push(item.selected_sleeve_option);
  if (item.custom_measurements) parts.push("Custom Size");
  parts.push(`Qty ${item.quantity}`);
  return parts.map(escapeHtml).join(" · ");
}

function itemsTableHtml(items: AdminOrderItemRow[]): string {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #E7E5E2;">
          <p style="margin:0;font-weight:600;">${escapeHtml(item.product_name)}</p>
          <p style="margin:2px 0 0;font-size:13px;color:#6B6B6B;">${itemLineDescription(item)}</p>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #E7E5E2;text-align:right;white-space:nowrap;">
          ${formatPrice(item.unit_price * item.quantity)}
        </td>
      </tr>`
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>`;
}

function totalsHtml(order: AdminOrderRow): string {
  const rows: Array<[string, string]> = [
    ["Subtotal", formatPrice(order.subtotal)],
    ["Shipping", formatPrice(order.shipping_amount)],
  ];
  if (order.discount_amount > 0) {
    rows.push([order.coupon_code ? `Discount (${escapeHtml(order.coupon_code)})` : "Discount", `-${formatPrice(order.discount_amount)}`]);
  }
  if (order.tax_amount > 0) rows.push(["Tax", formatPrice(order.tax_amount)]);

  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<div style="display:flex;justify-content:space-between;padding:2px 0;font-size:14px;"><span style="color:#6B6B6B;">${label}</span><span>${value}</span></div>`
    )
    .join("");

  return `
    ${rowsHtml}
    <div style="display:flex;justify-content:space-between;padding:8px 0 0;margin-top:6px;border-top:1px solid #E7E5E2;font-weight:600;">
      <span>Total</span><span>${formatPrice(order.total)}</span>
    </div>
  `;
}

/** To the team inbox (site.contactEmail) — fired once, when an order's payment is confirmed. */
export function newOrderAdminEmailHtml(order: AdminOrderRow, items: AdminOrderItemRow[]): string {
  return `
    <div style="${WRAPPER_STYLE}">
      <h1 style="${HEADING_STYLE}">New order — ${escapeHtml(order.order_number)}</h1>
      <p style="margin:0 0 16px;color:#6B6B6B;font-size:14px;">
        Placed ${new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} ·
        Payment: ${escapeHtml(order.payment_status)}
      </p>

      <div style="${CARD_STYLE}">
        <p style="${LABEL_STYLE}">Customer</p>
        <p style="margin:0;">${escapeHtml(order.email)}</p>
        <p style="margin:0;">${escapeHtml(order.phone)}</p>
      </div>

      <div style="${CARD_STYLE}">
        <p style="${LABEL_STYLE}">Shipping Address</p>
        ${addressHtml(order.shipping_address)}
      </div>

      <div style="${CARD_STYLE}">
        <p style="${LABEL_STYLE}">Items</p>
        ${itemsTableHtml(items)}
        <div style="margin-top:12px;">${totalsHtml(order)}</div>
      </div>

      <a href="${SITE_URL}/admin/orders/${order.id}" style="${LINK_BUTTON_STYLE}">View order in admin</a>
    </div>
  `;
}

function trackingBlockHtml(order: AdminOrderRow): string {
  if (!order.tracking_number && !order.tracking_url) return "";
  return `
    <div style="${CARD_STYLE}">
      <p style="${LABEL_STYLE}">Tracking</p>
      ${order.tracking_number ? `<p style="margin:0;">${escapeHtml(order.tracking_number)}</p>` : ""}
      ${order.tracking_url ? `<a href="${escapeHtml(order.tracking_url)}" style="${LINK_BUTTON_STYLE}">Track your package</a>` : ""}
    </div>
  `;
}

/** To the customer (order.email) — fired when an admin adds/changes tracking info. */
export function orderTrackingEmailHtml(order: AdminOrderRow): string {
  const address = parseShippingAddress(order.shipping_address);
  return `
    <div style="${WRAPPER_STYLE}">
      <h1 style="${HEADING_STYLE}">Tracking added for your order</h1>
      <p style="margin:0 0 16px;font-size:14px;">
        Hi${address?.fullName ? ` ${escapeHtml(address.fullName)}` : ""}, here's the tracking info for order
        <strong>${escapeHtml(order.order_number)}</strong>.
      </p>
      ${trackingBlockHtml(order)}
      <a href="${SITE_URL}/account/orders/${order.id}" style="${LINK_BUTTON_STYLE}">View your order</a>
    </div>
  `;
}

/** To the customer (order.email) — fired when an order's status transitions to "shipped". */
export function orderShippedEmailHtml(order: AdminOrderRow): string {
  const address = parseShippingAddress(order.shipping_address);
  return `
    <div style="${WRAPPER_STYLE}">
      <h1 style="${HEADING_STYLE}">Your order has shipped</h1>
      <p style="margin:0 0 16px;font-size:14px;">
        Hi${address?.fullName ? ` ${escapeHtml(address.fullName)}` : ""}, great news — order
        <strong>${escapeHtml(order.order_number)}</strong> is on its way.
      </p>
      ${trackingBlockHtml(order)}
      <a href="${SITE_URL}/account/orders/${order.id}" style="${LINK_BUTTON_STYLE}">View your order</a>
    </div>
  `;
}
