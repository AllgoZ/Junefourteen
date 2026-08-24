import { Badge } from "@/components/ui/badge";

const ORDER_STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "secondary",
  processing: "secondary",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={ORDER_STATUS_VARIANT[status] ?? "outline"} className="capitalize">
      {status}
    </Badge>
  );
}

const PAYMENT_STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  paid: "default",
  failed: "destructive",
  refunded: "secondary",
};

export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={PAYMENT_STATUS_VARIANT[status] ?? "outline"} className="capitalize">
      {status}
    </Badge>
  );
}

export function StockStatusBadge({
  stockQuantity,
  lowStockThreshold,
}: {
  stockQuantity: number;
  lowStockThreshold: number;
}) {
  if (stockQuantity <= 0) return <Badge variant="destructive">Out of Stock</Badge>;
  if (stockQuantity <= lowStockThreshold) return <Badge variant="outline">Low Stock</Badge>;
  return <Badge variant="secondary">In Stock</Badge>;
}
