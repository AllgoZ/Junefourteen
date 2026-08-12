import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EditorialImage } from "@/components/ui/editorial-image";
import type { Collection } from "@/types/product";

function CollectionTile({ collection, className }: { collection: Collection; className?: string }) {
  return (
    <Link
      href={`/shop?collection=${collection.slug}`}
      className={"group relative block h-full overflow-hidden rounded-xl " + (className ?? "")}
    >
      <EditorialImage
        src={collection.imageSrc}
        tone={collection.tone}
        aspect="tall"
        alt={`${collection.name} collection`}
        decorative
        sizes="(min-width: 1024px) 50vw, 80vw"
        className="h-full transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-5 sm:p-6">
        <h3 className="font-serif text-xl text-white sm:text-2xl">{collection.name}</h3>
        <span className="flex items-center gap-1 text-xs tracking-wide text-white/85 uppercase">
          Explore the Collection <ArrowRight className="size-3" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export function FeaturedCollections({ collections }: { collections: Collection[] }) {
  const [feature, ...rest] = collections;
  if (!feature) return null;

  return (
    <>
      {/* Desktop: one large editorial panel + stacked secondary panels — asymmetric, not four equal cards */}
      <div className="hidden px-4 sm:px-8 lg:grid lg:h-[760px] lg:grid-cols-2 lg:grid-rows-1 lg:gap-4 lg:px-12">
        <CollectionTile collection={feature} className="min-h-0" />
        <div className="grid min-h-0 grid-rows-3 gap-4">
          {rest.map((collection) => (
            <CollectionTile key={collection.slug} collection={collection} className="min-h-0" />
          ))}
        </div>
      </div>

      {/* Mobile/tablet: immersive horizontal carousel */}
      <div className="no-scrollbar snap-x-mandatory flex gap-3 overflow-x-auto px-4 sm:px-8 lg:hidden">
        {collections.map((collection) => (
          <div key={collection.slug} className="snap-start aspect-[4/5] w-[80vw] shrink-0 sm:w-[45vw]">
            <CollectionTile collection={collection} />
          </div>
        ))}
      </div>
    </>
  );
}
