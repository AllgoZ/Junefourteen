import { Search, Boxes, AlertTriangle, PackageX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createAdminClient } from "@/lib/supabase/admin";
import { listProductsForInventory } from "@/lib/repositories/admin/inventory";
import { PageHeader } from "@/components/admin/ui/page-header";
import { StatCard } from "@/components/admin/ui/stat-card";
import { InventoryRow } from "@/components/admin/inventory-row";

export const metadata = { title: "Inventory" };

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const { q, filter } = await searchParams;
  const admin = createAdminClient();
  const allProducts = await listProductsForInventory(admin, q);

  const lowStockCount = allProducts.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold).length;
  const outOfStockCount = allProducts.filter((p) => p.stockQuantity <= 0).length;

  const products = allProducts.filter((p) => {
    if (filter === "low") return p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold;
    if (filter === "out") return p.stockQuantity <= 0;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Inventory"
        description={`${allProducts.length} product${allProducts.length === 1 ? "" : "s"} tracked. Stock is separate from the "Sold Out" flag on each product.`}
      />

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total SKUs" value={String(allProducts.length)} icon={Boxes} />
        <StatCard label="Low Stock" value={String(lowStockCount)} icon={AlertTriangle} tone={lowStockCount > 0 ? "warn" : "default"} />
        <StatCard label="Out of Stock" value={String(outOfStockCount)} icon={PackageX} tone={outOfStockCount > 0 ? "warn" : "default"} />
      </div>

      <form className="mt-5 flex flex-wrap gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input name="q" defaultValue={q} placeholder="Search by name…" className="pl-8" />
        </div>
        <select
          name="filter"
          defaultValue={filter ?? ""}
          className="rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm text-foreground"
        >
          <option value="">All stock levels</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
      </form>

      <div className="mt-4 rounded-xl border border-border bg-card shadow-[var(--shadow-subtle)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <InventoryRow key={p.id} product={p} />
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
