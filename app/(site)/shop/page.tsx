import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Breadcrumb } from "@/components/shop/breadcrumb";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { ProductGrid } from "@/components/product/product-grid";
import {
  getAllCategories,
  getAllSleeveOptions,
  getCollections,
  getProducts,
} from "@/lib/services/products";
import { parseShopSearchParams, type ShopSearchParams } from "@/lib/shop-filters";
import { site } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Shop",
  description: `Shop the full ${site.name} collection — handloom textiles and considered tailoring.`,
};

function first(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const rawParams = await searchParams;
  const shopParams: ShopSearchParams = {
    collection: first(rawParams.collection),
    category: first(rawParams.category),
    size: first(rawParams.size),
    sleeve: first(rawParams.sleeve),
    price: first(rawParams.price),
    inStock: first(rawParams.inStock),
    sort: first(rawParams.sort),
    q: first(rawParams.q),
  };

  const [products, categories, sleeveOptions, collections] = await Promise.all([
    getProducts(parseShopSearchParams(shopParams)),
    getAllCategories(),
    getAllSleeveOptions(),
    getCollections(),
  ]);

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />

      <ShopToolbar
        productCount={products.length}
        categories={categories}
        sleeveOptions={sleeveOptions}
        collections={collections}
      />

      <div className="pt-8">
        <ProductGrid products={products} />
      </div>
    </Container>
  );
}
