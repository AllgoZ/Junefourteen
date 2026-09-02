import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, MapPin, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ProductImage } from "@/components/product/product-image";
import { requireUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { getOrderWithItems } from "@/lib/repositories/orders";
import { formatPrice } from "@/lib/format";
import type { Json } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Order Detail" };

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

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

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser();

  const supabase = await createClient();
  const result = await getOrderWithItems(supabase, id);
  // RLS (orders_owner_select: auth.uid() = user_id) already means this is
  // null for someone else's order id, not just a missing one — notFound()
  // either way, never leak which case it was.
  if (!result) notFound();
  const { order, items } = result;

  return (
    <Container size="narrow" className="py-8 sm:py-12">
      <Link
        href="/account"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Orders
      </Link>

      <h1 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">{order.order_number}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        {" · "}
        {STATUS_LABEL[order.status] ?? order.status}
      </p>

      {(order.tracking_url || order.tracking_number) && (
        <div className="mt-6 flex items-start gap-2.5 rounded-md border border-foreground p-4">
          <Truck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">Shipment Tracking</p>
            {order.tracking_url ? (
              <a
                href={order.tracking_url}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 inline-block text-sm text-foreground underline underline-offset-4"
              >
                {order.tracking_number || "Track Package"}
              </a>
            ) : (
              <p className="mt-0.5 text-sm text-muted-foreground">{order.tracking_number}</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-start gap-2.5 rounded-md border border-border p-4">
        <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <AddressBlock address={order.shipping_address} />
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-medium text-foreground">Items</h2>
        <div className="mt-3 flex flex-col divide-y divide-border rounded-md border border-border">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-4">
              <div className="w-14 shrink-0">
                <ProductImage
                  image={{ id: item.id, alt: item.product_name, src: item.product_image ?? undefined, tone: 0.3 }}
                  alt={item.product_name}
                  aspect="square"
                  className="rounded-sm"
                />
              </div>
              <div className="flex-1 text-sm">
                <p className="text-foreground">{item.product_name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.selected_pieces && item.selected_pieces}
                  {item.selected_pieces && item.selected_size && " · "}
                  {item.selected_size && `Size ${item.selected_size}`}
                  {item.selected_sleeve_option && ` · ${item.selected_sleeve_option}`}
                  {item.custom_measurements && " · Custom Size"}
                  {` · Qty ${item.quantity}`}
                </p>
              </div>
              <span className="shrink-0 text-sm tabular-nums">{formatPrice(item.unit_price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5 rounded-md border border-border p-4 text-sm">
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
    </Container>
  );
}
