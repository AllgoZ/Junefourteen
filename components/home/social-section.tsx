import { EditorialImage } from "@/components/ui/editorial-image";
import { Container } from "@/components/layout/container";
import { GALLERY_IMAGES } from "@/lib/mock-data/gallery-images";
import { site } from "@/lib/config/site";

const TILE_TONES = [0.12, 0.3, 0.48, 0.62, 0.78, 0.9];

export function SocialSection() {
  const instagram = site.social.find((s) => s.label === "Instagram")?.href ?? site.social[0].href;

  return (
    <section className="py-14 sm:py-20">
      <Container className="mb-6 text-center sm:mb-8">
        <h2 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">Follow Along</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          @{site.name.toLowerCase()} on Instagram
        </p>
      </Container>
      <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
        {TILE_TONES.map((tone, i) => (
          <a
            key={i}
            href={instagram}
            target="_blank"
            rel="noreferrer"
            className="block transition-opacity hover:opacity-80"
          >
            <EditorialImage
              src={GALLERY_IMAGES[i % GALLERY_IMAGES.length]}
              tone={tone}
              aspect="square"
              alt={`${site.name} on Instagram`}
              decorative
              sizes="(min-width: 640px) 16vw, 33vw"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
