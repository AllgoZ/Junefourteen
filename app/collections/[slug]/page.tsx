import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Breadcrumb } from "@/components/shop/breadcrumb";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { ProductGrid } from "@/components/product/product-grid";
import {
  getAllCategories,
  getAllSleeveOptions,
  getCollectionBySlug,
  getCollections,
  getProducts,
} from "@/lib/services/products";
import { parseShopSearchParams, type ShopSearchParams } from "@/lib/shop-filters";

function first(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return {};
  return {
    title: collection.name,
    description: collection.description,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const rawParams = await searchParams;
  const shopParams: ShopSearchParams = {
    category: first(rawParams.category),
    size: first(rawParams.size),
    sleeve: first(rawParams.sleeve),
    price: first(rawParams.price),
    inStock: first(rawParams.inStock),
    sort: first(rawParams.sort),
  };

  const [products, categories, sleeveOptions, collections] = await Promise.all([
    getProducts({ ...parseShopSearchParams(shopParams), collectionSlugs: [slug] }),
    getAllCategories(),
    getAllSleeveOptions(),
    getCollections(),
  ]);

  return (
    <Container className="py-6">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: collection.name },
        ]}
      />

      <ShopToolbar
        productCount={products.length}
        categories={categories}
        sleeveOptions={sleeveOptions}
        collections={collections}
        hideCollectionFacet
      />

      <div className="pt-8">
        <ProductGrid products={products} />
      </div>
    </Container>
  );
}
