import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice } from "@/lib/format";
import type { OrderRow } from "@/lib/repositories/orders";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrdersPanel({ orders }: { orders: OrderRow[] }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="Order history and tracking will show up here once you place an order."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/shop">Start Shopping</Link>
          </Button>
        }
        className="items-start px-0 py-4 text-left"
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3 py-4 text-left">
      {orders.map((order) => (
        <li
          key={order.id}
          className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
        >
          <div>
            <p className="text-sm font-medium text-foreground">{order.order_number}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              {" · "}
              {STATUS_LABEL[order.status] ?? order.status}
            </p>
          </div>
          <span className="text-sm font-medium tabular-nums">{formatPrice(order.total)}</span>
        </li>
      ))}
    </ul>
  );
}
