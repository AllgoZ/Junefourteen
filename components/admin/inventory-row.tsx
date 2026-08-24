"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { StockStatusBadge } from "@/components/admin/ui/status-badge";
import { updateStockAction } from "@/app/admin/(protected)/inventory/actions";
import type { AdminInventoryRow } from "@/lib/repositories/admin/inventory";

export function InventoryRow({ product }: { product: AdminInventoryRow }) {
  const [value, setValue] = useState(product.stockQuantity);
  const [isPending, startTransition] = useTransition();
  const dirty = value !== product.stockQuantity;

  function save() {
    startTransition(() => updateStockAction(product.id, value));
  }

  return (
    <TableRow>
      <TableCell>
        <Link href={`/admin/products/${product.id}`} className="group flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
            {product.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, not worth a Cloudinary loader round trip
              <img src={product.thumbnail} alt="" className="size-full object-cover" />
            ) : (
              <ImageOff className="size-4 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <span className="font-medium text-foreground group-hover:underline">{product.name}</span>
        </Link>
      </TableCell>
      <TableCell className="text-muted-foreground">{product.category}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(Math.max(0, Number(e.target.value) || 0))}
            className="w-20 tabular-nums"
          />
          {dirty && (
            <Button type="button" size="sm" variant="ghost" disabled={isPending} onClick={save}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          )}
        </div>
      </TableCell>
      <TableCell>
        <StockStatusBadge stockQuantity={value} lowStockThreshold={product.lowStockThreshold} />
      </TableCell>
    </TableRow>
  );
}
