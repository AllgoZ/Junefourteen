import { EditorialImage } from "@/components/ui/editorial-image";
import { Container } from "@/components/layout/container";
import { GALLERY_IMAGES } from "@/lib/mock-data/gallery-images";
import { site } from "@/lib/config/site";
import { getSocialLinks } from "@/lib/services/social-links";
import { getGalleryImages } from "@/lib/services/homepage";

const TILE_TONES = [0.15, 0.38, 0.6, 0.82];

export async function SocialSection() {
  const [dbSocialLinks, dbGalleryImages] = await Promise.all([getSocialLinks(), getGalleryImages()]);
  const socialLinks = dbSocialLinks.length > 0 ? dbSocialLinks : site.social;
  const instagram = socialLinks.find((s) => s.label === "Instagram")?.href ?? socialLinks[0].href;
  const galleryImages =
    dbGalleryImages.length > 0
      ? dbGalleryImages
      : TILE_TONES.map((tone, i) => ({
          imageUrl: GALLERY_IMAGES[i % GALLERY_IMAGES.length],
          imageAlt: `${site.name} on Instagram`,
          tone,
        }));

  return (
    <section className="py-14 sm:py-20">
      <Container className="mb-6 text-center sm:mb-8">
        <h2 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">Follow Along</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          @{site.name.toLowerCase()} on Instagram
        </p>
      </Container>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {galleryImages.map((image, i) => (
          <a
            key={i}
            href={instagram}
            target="_blank"
            rel="noreferrer"
            className="block transition-opacity hover:opacity-80"
          >
            <EditorialImage
              src={image.imageUrl}
              tone={image.tone}
              aspect="square"
              alt={image.imageAlt}
              decorative
              sizes="(min-width: 640px) 25vw, 50vw"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
