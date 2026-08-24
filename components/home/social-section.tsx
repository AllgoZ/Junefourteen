import { EditorialImage } from "@/components/ui/editorial-image";
import { Container } from "@/components/layout/container";
import { GALLERY_IMAGES } from "@/lib/mock-data/gallery-images";
import { site } from "@/lib/config/site";
import { getSocialLinks } from "@/lib/services/social-links";

const TILE_TONES = [0.15, 0.38, 0.6, 0.82];

export async function SocialSection() {
  const dbSocialLinks = await getSocialLinks();
  const socialLinks = dbSocialLinks.length > 0 ? dbSocialLinks : site.social;
  const instagram = socialLinks.find((s) => s.label === "Instagram")?.href ?? socialLinks[0].href;

  return (
    <section className="py-14 sm:py-20">
      <Container className="mb-6 text-center sm:mb-8">
        <h2 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">Follow Along</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          @{site.name.toLowerCase()} on Instagram
        </p>
      </Container>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
              sizes="(min-width: 640px) 25vw, 50vw"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
