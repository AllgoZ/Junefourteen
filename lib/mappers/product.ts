import type { ProductRow } from "@/lib/repositories/products";
import type { Product, Size, SleeveOption } from "@/types/product";

function bySortOrder<T extends { sort_order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}

export function dbProductToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    shortDescription: row.short_description,
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    images: bySortOrder(row.product_images).map((image) => ({
      id: image.id,
      alt: image.alt,
      src: image.image_url,
      tone: image.tone,
    })),
    category: row.category,
    collectionSlugs: bySortOrder(row.product_collections)
      .map((pc) => pc.collections?.slug)
      .filter((slug): slug is string => Boolean(slug)),
    tags: row.tags,
    isNew: row.is_new,
    isBestSeller: row.is_best_seller,
    isSoldOut: row.is_sold_out,
    sizes: bySortOrder(row.product_sizes).map((s) => s.size as Size),
    sleeveOptions: row.product_sleeve_options.length
      ? bySortOrder(row.product_sleeve_options).map((s) => s.sleeve_option as SleeveOption)
      : undefined,
    pieces: (() => {
      const active = bySortOrder(row.product_pieces.filter((p) => p.is_active));
      return active.length
        ? active.map((p) => ({ id: p.id, name: p.name, price: p.price, defaultSelected: p.default_selected }))
        : undefined;
    })(),
    sizeChartImage: row.size_chart_image_url
      ? { src: row.size_chart_image_url, alt: row.size_chart_image_alt ?? "" }
      : undefined,
    supportsCustomSize: row.custom_size_enabled,
    fabric: row.fabric,
    washCare: row.wash_care,
    shippingInfo: row.shipping_info,
    fitNotes: row.fit_notes,
  };
}
