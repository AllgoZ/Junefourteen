import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrderForAdmin } from "@/lib/repositories/admin/orders";
import { updateOrderStatusAction } from "@/app/admin/(protected)/orders/actions";
import { formatPrice } from "@/lib/format";
import type { Json } from "@/lib/supabase/types";

export const metadata = { title: "Order Detail" };

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const SELECT_CLASS = "rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm text-foreground capitalize";

function AddressBlock({ address }: { address: Json }) {
  if (!address || typeof address !== "object" || Array.isArray(address)) return null;
  const a = address as Record<string, string | null>;
  return (
    <div className="text-sm text-muted-foreground">
      <p className="font-medium text-foreground">{a.fullName}</p>
      <p>{a.phone}</p>
      <p>
        {a.addressLine1}
        {a.addressLine2 ? `, ${a.addressLine2}` : ""}
      </p>
      <p>
        {a.city}, {a.state} {a.pin}
      </p>
      <p>{a.country}</p>
    </div>
  );
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  const result = await getOrderForAdmin(admin, id);
  if (!result) notFound();
  const { order, items } = result;

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Orders
      </Link>

      <h1 className="text-2xl font-medium tracking-tight text-foreground">{order.order_number}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {order.email} · {order.phone}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminCard title="Shipping Address">
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" strokeWidth={1.75} />
            <AddressBlock address={order.shipping_address} />
          </div>
        </AdminCard>

        <AdminCard title="Status">
          <form action={updateOrderStatusAction} className="flex flex-col gap-3">
            <input type="hidden" name="id" value={order.id} />
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
              Order Status
              <select name="status" defaultValue={order.status} className={SELECT_CLASS}>
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
              Payment Status
              <select name="paymentStatus" defaultValue={order.payment_status} className={SELECT_CLASS}>
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" size="sm" className="mt-1 self-start">
              Update Status
            </Button>
          </form>
        </AdminCard>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-medium text-foreground">Items</h2>
        <div className="mt-3 flex flex-col divide-y divide-border rounded-xl border border-border bg-card shadow-[var(--shadow-subtle)]">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 p-4 text-sm">
              <div>
                <p className="font-medium text-foreground">{item.product_name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.selected_size && `Size ${item.selected_size}`}
                  {item.selected_sleeve_option && ` · ${item.selected_sleeve_option}`}
                  {item.custom_measurements && " · Custom Size"}
                  {` · Qty ${item.quantity}`}
                </p>
              </div>
              <span className="shrink-0 tabular-nums">{formatPrice(item.unit_price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-1.5 rounded-xl border border-border bg-card p-4 text-sm shadow-[var(--shadow-subtle)]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="tabular-nums">{formatPrice(order.shipping_amount)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-border pt-2 font-medium text-foreground">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
