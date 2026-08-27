import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { EditorialSplit } from "@/components/home/editorial-split";
import { EditorialImage } from "@/components/ui/editorial-image";
import { site } from "@/lib/config/site";
import { getAboutPageContent } from "@/lib/services/about";

export const metadata: Metadata = {
  title: "About",
  description: `The story and philosophy behind ${site.name}.`,
};

const FALLBACK = {
  heroImageUrl: "/images/models-duo-red-maroon-sets.webp",
  heroImageAlt: `${site.name} studio`,
  heading: "Quietly Bold",
  introBody: `${site.name} began as a small studio working directly with handloom weavers across South India. What started as a handful of pieces made for friends has grown into a considered edit of everyday and occasion wear — still built the same way, one length of cloth at a time.`,
  storyEyebrow: "Our Story",
  storyTitle: "Built on craft, not trend.",
  storyBody: `Every ${site.name} piece begins with a relationship, not a spreadsheet — the weavers and tailors we work with have shaped this label as much as we have. That relationship is why our pieces carry the small irregularities of handmade cloth, and why we'd rather make less, better.`,
  storyImageUrl: "/images/model-half-saree-mustard-purple.webp",
  storyImageAlt: `${site.name} weaving process`,
  philosophyEyebrow: "Our Philosophy",
  philosophyTitle: "Made for the way you move.",
  philosophyBody:
    "We design around the body in motion, not the mannequin at rest. Every cut is tested for how it feels to sit, walk, and reach — not just how it photographs.",
  philosophyImageUrl: "/images/model-mustard-kurta-kalamkari-dupatta.webp",
  philosophyImageAlt: `${site.name} design process`,
  journalEyebrow: "Journal",
  journalTitle: "Notes From the Studio",
  journalBody:
    "Our journal — weaver profiles, styling notes, and behind-the-scenes from the studio — is launching soon.",
};

export default async function AboutPage() {
  const content = (await getAboutPageContent()) ?? FALLBACK;

  return (
    <div>
      <EditorialImage
        src={content.heroImageUrl}
        tone={0.4}
        aspect="wide"
        alt={content.heroImageAlt}
        decorative
        priority
        sizes="100vw"
        objectPosition="50% 15%"
        className="sm:aspect-[21/9]"
      />

      <Container size="narrow" className="py-14 text-center">
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          About {site.name}
        </p>
        <h1 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">{content.heading}</h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">{content.introBody}</p>
      </Container>

      <div id="story">
        <EditorialSplit
          eyebrow={content.storyEyebrow}
          title={content.storyTitle}
          body={content.storyBody}
          imageSrc={content.storyImageUrl}
          imageTone={0.22}
          imageAlt={content.storyImageAlt}
        />
      </div>

      <div id="philosophy">
        <EditorialSplit
          eyebrow={content.philosophyEyebrow}
          title={content.philosophyTitle}
          body={content.philosophyBody}
          imageSrc={content.philosophyImageUrl}
          imageTone={0.62}
          imageAlt={content.philosophyImageAlt}
          imageSide="right"
        />
      </div>

      <Container id="journal" size="narrow" className="py-14 text-center">
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          {content.journalEyebrow}
        </p>
        <h2 className="mt-3 font-serif text-2xl text-foreground">{content.journalTitle}</h2>
        <p className="mt-4 text-sm text-muted-foreground">{content.journalBody}</p>
        <Link href="/contact" className="mt-4 inline-block text-sm text-foreground underline underline-offset-4">
          Get in touch
        </Link>
      </Container>
    </div>
  );
}
