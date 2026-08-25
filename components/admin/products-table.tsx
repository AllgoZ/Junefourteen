"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/format";
import {
  setProductActiveAction,
  bulkSetProductActiveAction,
  bulkDeleteProductsAction,
} from "@/app/admin/(protected)/products/actions";
import type { AdminProductListRow } from "@/lib/repositories/admin/products";

export function ProductsTable({ products }: { products: AdminProductListRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const allSelected = products.length > 0 && selected.size === products.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function handleBulkActivate(isActive: boolean) {
    const ids = Array.from(selected);
    startTransition(async () => {
      const result = await bulkSetProductActiveAction(ids, isActive);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`${ids.length} product${ids.length === 1 ? "" : "s"} ${isActive ? "activated" : "deactivated"}.`);
      clearSelection();
      router.refresh();
    });
  }

  function handleBulkDelete() {
    const ids = Array.from(selected);
    const confirmed = window.confirm(
      `Delete ${ids.length} product${ids.length === 1 ? "" : "s"}? Products with existing orders will be deactivated instead, to keep order history intact.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await bulkDeleteProductsAction(ids);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      const parts: string[] = [];
      if (result.deletedCount > 0) {
        parts.push(`Deleted ${result.deletedCount} product${result.deletedCount === 1 ? "" : "s"}.`);
      }
      if (result.deactivatedInstead.length > 0) {
        parts.push(
          `${result.deactivatedInstead.length} deactivated instead (has order history): ${result.deactivatedInstead.join(", ")}.`
        );
      }
      toast.success(parts.join(" ") || "Nothing to do.");
      clearSelection();
      router.refresh();
    });
  }

  return (
    <div className="mt-4 rounded-xl border border-border bg-card shadow-[var(--shadow-subtle)]">
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/50 px-4 py-2.5">
          <span className="text-sm font-medium text-foreground">{selected.size} selected</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => handleBulkActivate(true)}>
              Activate
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => handleBulkActivate(false)}>
              Deactivate
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={handleBulkDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Delete
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={clearSelection}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={toggleAll}
                aria-label="Select all products"
                className="size-4 rounded border-input accent-foreground"
              />
            </TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Collections</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Manage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id} data-state={selected.has(p.id) ? "selected" : undefined}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggleOne(p.id)}
                  aria-label={`Select ${p.name}`}
                  className="size-4 rounded border-input accent-foreground"
                />
              </TableCell>
              <TableCell>
                <Link href={`/admin/products/${p.id}`} className="group flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                    {p.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, not worth a Cloudinary loader round trip
                      <img src={p.thumbnail} alt="" className="size-full object-cover" />
                    ) : (
                      <ImageOff className="size-4 text-muted-foreground" aria-hidden="true" />
                    )}
                  </div>
                  <span className="font-medium text-foreground group-hover:underline">{p.name}</span>
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{p.category}</TableCell>
              <TableCell className="text-muted-foreground">{p.collectionNames.join(", ") || "—"}</TableCell>
              <TableCell className="tabular-nums">{formatPrice(p.price)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {!p.is_active && <Badge variant="outline">Inactive</Badge>}
                  {p.is_sold_out && <Badge variant="destructive">Sold Out</Badge>}
                  {p.is_new && <Badge>New</Badge>}
                  {p.is_best_seller && <Badge variant="secondary">Best Seller</Badge>}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <form action={setProductActiveAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="isActive" value={(!p.is_active).toString()} />
                  <Button type="submit" variant="ghost" size="sm">
                    {p.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                No products found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
