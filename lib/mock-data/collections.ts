import type { Collection } from "@/types/product";

export const collections: Collection[] = [
  {
    slug: "everyday-edit",
    name: "Everyday Edit",
    description:
      "Easy cottons and considered basics, cut for the days that ask you to move without thinking about what you're wearing.",
    tone: 0.15,
    imageSrc: "/images/model-mustard-kurta-kalamkari-dupatta.webp",
  },
  {
    slug: "handloom-stories",
    name: "Handloom Stories",
    description:
      "Woven by hand across small mills we work with directly — every length carries the slight, deliberate irregularity that makes it one of a kind.",
    tone: 0.4,
    imageSrc: "/images/model-half-saree-mustard-purple.webp",
  },
  {
    slug: "festive-edit",
    name: "Festive Edit",
    description:
      "Considered pieces for the occasions that matter, built on craft rather than embellishment for its own sake.",
    tone: 0.65,
    imageSrc: "/images/model-maroon-anarkali-printed-dupatta.webp",
  },
  {
    slug: "contemporary-classics",
    name: "Contemporary Classics",
    description:
      "Silhouettes we return to season after season — quiet, exacting, and built to outlast the trend cycle.",
    tone: 0.85,
    imageSrc: "/images/model-cream-anarkali-blue-wall.webp",
  },
];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}
