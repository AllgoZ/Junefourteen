import { Container } from "@/components/layout/container";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { HomeSection } from "@/components/home/home-section";
import { ProductRail } from "@/components/product/product-rail";
import { ProductGrid } from "@/components/product/product-grid";
import { EditorialSplit } from "@/components/home/editorial-split";
import { SocialSection } from "@/components/home/social-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { getBestSellers, getCollections, getNewArrivals } from "@/lib/services/products";
import { site } from "@/lib/config/site";

export default async function HomePage() {
  const [collections, newArrivals, bestSellers] = await Promise.all([
    getCollections(),
    getNewArrivals(),
    getBestSellers(),
  ]);

  return (
    <>
      <HeroSection />

      <HomeSection title="Featured Collections" viewAllHref="/shop">
        <FeaturedCollections collections={collections} />
      </HomeSection>

      <HomeSection title="New Arrivals" subtitle="Just landed." viewAllHref="/shop?sort=newest">
        <ProductRail products={newArrivals} />
      </HomeSection>

      <EditorialSplit
        eyebrow="Our Philosophy"
        title="Made for the way you move."
        body="We build every piece around the body in motion, not the mannequin at rest — considered cuts, breathable cloth, and construction that holds up to a real day."
        imageSrc="/images/model-purple-kurta-red-door.webp"
        imageTone={0.68}
        imageAlt={`${site.name} editorial imagery`}
        cta={{ label: "Read Our Story", href: "/about" }}
      />

      <HomeSection
        title="Best Sellers"
        subtitle="The pieces our customers reach for again and again."
        viewAllHref="/shop?sort=best-selling"
      >
        <Container>
          <ProductGrid products={bestSellers} />
        </Container>
      </HomeSection>

      <EditorialSplit
        eyebrow="Our Story"
        title="Built on craft, not trend."
        body={`${site.name} began as a small studio working directly with handloom weavers across South India. That relationship still shapes everything we make — considered, unhurried, built to be worn for years rather than a season.`}
        imageSrc="/images/model-cream-anarkali-blue-wall.webp"
        imageTone={0.22}
        imageAlt={`${site.name} studio and weaving process`}
        imageSide="right"
        cta={{ label: `About ${site.name}`, href: "/about" }}
      />

      <SocialSection />
      <NewsletterSection />
    </>
  );
}
