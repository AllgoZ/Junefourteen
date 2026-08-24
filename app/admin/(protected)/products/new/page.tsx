import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAllCollectionsForAdmin } from "@/lib/repositories/admin/collections";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "New Product" };

export default async function NewProductPage() {
  const admin = createAdminClient();
  const collections = await listAllCollectionsForAdmin(admin);

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Products
      </Link>
      <h1 className="text-2xl font-medium tracking-tight text-foreground">New Product</h1>
      <div className="mt-6">
        <ProductForm collections={collections.map((c) => ({ id: c.id, name: c.name }))} />
      </div>
    </div>
  );
}
