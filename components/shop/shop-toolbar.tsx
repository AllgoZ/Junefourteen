import { FilterSheet } from "@/components/shop/filter-sheet";
import { SortSheet } from "@/components/shop/sort-sheet";
import { FilterBarDesktop } from "@/components/shop/filter-bar-desktop";
import type { Collection, SleeveOption } from "@/types/product";

interface ShopToolbarProps {
  productCount: number;
  categories: string[];
  sleeveOptions: SleeveOption[];
  collections: Collection[];
  hideCollectionFacet?: boolean;
}

export function ShopToolbar({
  productCount,
  categories,
  sleeveOptions,
  collections,
  hideCollectionFacet,
}: ShopToolbarProps) {
  const countLabel = `${productCount} ${productCount === 1 ? "Product" : "Products"}`;

  return (
    <div className="border-b border-border py-4">
      {/* Mobile/tablet: iOS-style bottom sheets */}
      <div className="lg:hidden">
        <p className="mb-3 text-sm text-muted-foreground">{countLabel}</p>
        <div className="flex items-center gap-2">
          <FilterSheet
            categories={categories}
            sleeveOptions={sleeveOptions}
            collections={collections}
            hideCollectionFacet={hideCollectionFacet}
          />
          <SortSheet />
        </div>
      </div>

      {/* Desktop: lightweight horizontal control bar */}
      <div className="hidden items-center justify-between lg:flex">
        <p className="text-sm text-muted-foreground">{countLabel}</p>
        <FilterBarDesktop
          categories={categories}
          sleeveOptions={sleeveOptions}
          collections={collections}
          hideCollectionFacet={hideCollectionFacet}
        />
      </div>
    </div>
  );
}
