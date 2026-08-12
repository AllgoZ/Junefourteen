import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Breadcrumb } from "@/components/shop/breadcrumb";
import { ProductGallery } from "@/components/product/product-gallery";
import { AddToBagPanel } from "@/components/product/add-to-bag-panel";
import { ProductInfoAccordion } from "@/components/product/product-info-accordion";
import { HomeSection } from "@/components/home/home-section";
import { ProductRail } from "@/components/product/product-rail";
import {
  getProductBySlug,
  getProducts,
  getRelatedProducts,
} from "@/lib/services/products";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <div>
      <Container className="pt-4">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: product.category, href: `/shop?category=${encodeURIComponent(product.category)}` },
            { label: product.name },
          ]}
        />
      </Container>

      <Container className="grid grid-cols-1 gap-10 py-6 lg:grid-cols-[1.3fr_1fr] lg:gap-16 lg:py-10">
        <ProductGallery images={product.images} productName={product.name} />
        <div className="lg:sticky lg:top-24 lg:self-start">
          <AddToBagPanel product={product} />
          <div className="mt-12">
            <ProductInfoAccordion product={product} />
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <HomeSection title="You May Also Like">
          <ProductRail products={related} />
        </HomeSection>
      )}
    </div>
  );
}
