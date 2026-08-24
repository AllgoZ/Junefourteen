import type { CollectionRow } from "@/lib/repositories/collections";
import type { Collection } from "@/types/product";

export function dbCollectionToCollection(row: CollectionRow): Collection {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    tone: row.tone,
    imageSrc: row.image_url ?? undefined,
  };
}
