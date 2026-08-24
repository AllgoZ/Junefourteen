import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProductForAdmin } from "@/lib/repositories/admin/products";
import { listAllCollectionsForAdmin } from "@/lib/repositories/admin/collections";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const [product, collections] = await Promise.all([
    getProductForAdmin(admin, id),
    listAllCollectionsForAdmin(admin),
  ]);

  if (!product) notFound();

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Products
      </Link>
      <h1 className="text-2xl font-medium tracking-tight text-foreground">{product.name}</h1>
      <div className="mt-6">
        <ProductForm product={product} collections={collections.map((c) => ({ id: c.id, name: c.name }))} />
      </div>
    </div>
  );
}
