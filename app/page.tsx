import { Container } from "@/components/layout/container";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { HomeSection } from "@/components/home/home-section";
import { CampaignImage } from "@/components/home/campaign-image";
import { ScrollShowcaseSection } from "@/components/home/scroll-showcase-section";
import { ProductGrid } from "@/components/product/product-grid";
import { SocialSection } from "@/components/home/social-section";
import {
  getBestSellers,
  getCollections,
  getNewArrivals,
  getProducts,
} from "@/lib/services/products";

export default async function HomePage() {
  const [collections, newArrivals, bestSellers, blackEdit] = await Promise.all([
    getCollections(),
    getNewArrivals(6),
    getBestSellers(6),
    getProducts({ collectionSlugs: ["black-edit"] }),
  ]);

  return (
    <>
      <HeroSection />

      <HomeSection title="Collections" compact>
        <FeaturedCollections collections={collections} />
      </HomeSection>

      <HomeSection title="New Arrivals" viewAllHref="/shop?sort=newest" compact>
        <Container className="px-2 sm:px-4">
          <ProductGrid products={newArrivals} />
        </Container>
      </HomeSection>

      <ScrollShowcaseSection colorProducts={bestSellers} blackProducts={blackEdit} />

      <CampaignImage
        src="/images/model-cream-anarkali-blue-wall.webp"
        tone={0.22}
        alt="JUNEFOURTEEN campaign imagery"
        link={{ label: "Shop Collection", href: "/shop" }}
      />

      <SocialSection />
    </>
  );
}
