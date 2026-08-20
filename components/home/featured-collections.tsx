import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EditorialImage } from "@/components/ui/editorial-image";
import type { Collection } from "@/types/product";

function CollectionTile({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/shop?collection=${collection.slug}`}
      aria-label={collection.name}
      className="group relative block overflow-hidden rounded-xl"
    >
      <EditorialImage
        src={collection.imageSrc}
        tone={collection.tone}
        aspect="tall"
        alt={`${collection.name} collection`}
        decorative
        sizes="50vw"
        className="transition-transform duration-700 group-hover:scale-105"
      />
    </Link>
  );
}

/**
 * Strict 2-up visual grid at every breakpoint — no carousel, no "peek" cards
 * (redesign v3 §13), no text on the images themselves (rawprompt pass: the
 * photograph is the entire tile, name/description dropped, accessible name
 * lives on the Link via aria-label instead).
 */
export function FeaturedCollections({ collections }: { collections: Collection[] }) {
  const visible = collections.filter((c) => c.slug !== "black-edit");

  return (
    <div>
      <div className="grid grid-cols-2 gap-1 px-1 sm:gap-2 sm:px-3 lg:grid-cols-4 lg:gap-4 lg:px-12">
        {visible.map((collection) => (
          <CollectionTile key={collection.slug} collection={collection} />
        ))}
      </div>
      <Link
        href="/shop"
        className="group mt-8 flex items-center justify-center gap-1.5 text-[11px] tracking-[0.2em] text-foreground uppercase sm:mt-10"
      >
        <span className="border-b border-transparent transition-colors group-hover:border-foreground">
          View All
        </span>
        <ArrowRight className="size-3" aria-hidden="true" />
      </Link>
    </div>
  );
}
