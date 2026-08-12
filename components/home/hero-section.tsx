import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EditorialImage } from "@/components/ui/editorial-image";
import { Container } from "@/components/layout/container";
import { site } from "@/lib/config/site";

export function HeroSection() {
  return (
    <section className="relative min-h-[70vh] overflow-hidden sm:min-h-[80vh] lg:min-h-[90vh]">
      <EditorialImage
        src="/images/models-duo-red-maroon-sets.webp"
        tone={0.55}
        alt={`${site.name} new collection campaign imagery`}
        decorative
        priority
        sizes="100vw"
        objectPosition="50% 15%"
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

      <Container className="absolute inset-x-0 bottom-0 pb-12 sm:pb-16 lg:pb-20">
        <div className="flex max-w-md flex-col items-start gap-4">
          <p className="text-xs font-medium tracking-[0.28em] text-white uppercase">
            New Collection
          </p>
          <h1 className="font-serif text-4xl text-white sm:text-5xl lg:text-6xl">
            Quietly Bold
          </h1>
          <p className="text-sm text-white/90 sm:text-base">
            Handloom textiles and considered tailoring, made for the way you move.
          </p>
          <Button asChild size="lg" className="mt-2 bg-white text-black hover:bg-white/90">
            <Link href="/shop">Shop Collection</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
