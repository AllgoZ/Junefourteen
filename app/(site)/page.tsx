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
import { getBanners } from "@/lib/services/banners";
import { getCampaignBanner } from "@/lib/services/homepage";

export default async function HomePage() {
  const [banners, collections, newArrivals, bestSellers, blackEdit, campaignBanner] = await Promise.all([
    getBanners(),
    getCollections(),
    getNewArrivals(6),
    getBestSellers(6),
    getProducts({ collectionSlugs: ["black-edit"] }),
    getCampaignBanner(),
  ]);

  return (
    <>
      <HeroSection banners={banners} />

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
        src={campaignBanner?.imageUrl ?? "/images/model-cream-anarkali-blue-wall.webp"}
        tone={campaignBanner?.tone ?? 0.22}
        alt={campaignBanner?.imageAlt ?? "JUNEFOURTEEN campaign imagery"}
        link={{
          label: campaignBanner?.linkLabel ?? "Shop Collection",
          href: campaignBanner?.linkHref ?? "/shop",
        }}
      />

      <SocialSection />
    </>
  );
}
