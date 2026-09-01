import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { OrderRequestRow } from "@/lib/repositories/order-requests";

const STATUS_LABEL: Record<string, string> = {
  new: "Requested",
  contacted: "Contacted",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

export function OrderRequestsPanel({ requests }: { requests: OrderRequestRow[] }) {
  if (requests.length === 0) {
    return (
      <EmptyState
        title="No order requests yet"
        description="Requests you make for sold-out products will show up here."
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
      {requests.map((request) => (
        <li key={request.id} className="rounded-md border border-border">
          <Link
            href={`/product/${request.product_slug}`}
            className="flex items-center justify-between gap-3 p-3 hover:bg-muted/50"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{request.product_name}</p>
              <p className="text-xs text-muted-foreground">
                Size {request.size} &middot; Qty {request.quantity}
                {" · "}
                {new Date(request.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <span className="text-xs font-medium tracking-[0.08em] text-foreground uppercase">
              {STATUS_LABEL[request.status] ?? request.status}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
