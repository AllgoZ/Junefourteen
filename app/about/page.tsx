import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { EditorialSplit } from "@/components/home/editorial-split";
import { EditorialImage } from "@/components/ui/editorial-image";
import { site } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "About",
  description: `The story and philosophy behind ${site.name}.`,
};

export default function AboutPage() {
  return (
    <div>
      <EditorialImage
        src="/images/models-duo-red-maroon-sets.webp"
        tone={0.4}
        aspect="wide"
        alt={`${site.name} studio`}
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
        <h1 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">Quietly Bold</h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          {site.name} began as a small studio working directly with handloom weavers across South
          India. What started as a handful of pieces made for friends has grown into a considered
          edit of everyday and occasion wear — still built the same way, one length of cloth at a
          time.
        </p>
      </Container>

      <div id="story">
        <EditorialSplit
          eyebrow="Our Story"
          title="Built on craft, not trend."
          body={`Every ${site.name} piece begins with a relationship, not a spreadsheet — the weavers and tailors we work with have shaped this label as much as we have. That relationship is why our pieces carry the small irregularities of handmade cloth, and why we'd rather make less, better.`}
          imageSrc="/images/model-half-saree-mustard-purple.webp"
          imageTone={0.22}
          imageAlt={`${site.name} weaving process`}
        />
      </div>

      <div id="philosophy">
        <EditorialSplit
          eyebrow="Our Philosophy"
          title="Made for the way you move."
          body="We design around the body in motion, not the mannequin at rest. Every cut is tested for how it feels to sit, walk, and reach — not just how it photographs."
          imageSrc="/images/model-mustard-kurta-kalamkari-dupatta.webp"
          imageTone={0.62}
          imageAlt={`${site.name} design process`}
          imageSide="right"
        />
      </div>

      <Container id="journal" size="narrow" className="py-14 text-center">
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Journal
        </p>
        <h2 className="mt-3 font-serif text-2xl text-foreground">Notes From the Studio</h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Our journal — weaver profiles, styling notes, and behind-the-scenes from the studio — is
          launching soon.
        </p>
        <Link href="/contact" className="mt-4 inline-block text-sm text-foreground underline underline-offset-4">
          Get in touch
        </Link>
      </Container>
    </div>
  );
}
