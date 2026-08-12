"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SheetDragHandle } from "@/components/ui/sheet-drag-handle";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PRICE_BANDS, countActiveFilters, type PriceBandKey } from "@/lib/shop-filters";
import { SIZES } from "@/types/product";
import type { SleeveOption } from "@/types/product";
import type { Collection } from "@/types/product";
import { cn } from "@/lib/utils";

interface FilterSheetProps {
  categories: string[];
  sleeveOptions: SleeveOption[];
  collections: Collection[];
  /** Hide the Collection facet when already scoped to a single collection page. */
  hideCollectionFacet?: boolean;
}

interface DraftFilters {
  categories: string[];
  sizes: string[];
  sleeve: string[];
  collections: string[];
  price?: PriceBandKey;
  inStock: boolean;
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function PillOption({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-sm transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}

export function FilterSheet({
  categories,
  sleeveOptions,
  collections,
  hideCollectionFacet,
}: FilterSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const buildDraft = (): DraftFilters => ({
    categories: searchParams.get("category")?.split(",").filter(Boolean) ?? [],
    sizes: searchParams.get("size")?.split(",").filter(Boolean) ?? [],
    sleeve: searchParams.get("sleeve")?.split(",").filter(Boolean) ?? [],
    collections: searchParams.get("collection")?.split(",").filter(Boolean) ?? [],
    price: (searchParams.get("price") as PriceBandKey) ?? undefined,
    inStock: searchParams.get("inStock") === "1",
  });

  const [draft, setDraft] = useState<DraftFilters>(buildDraft);

  const openWithFreshDraft = () => {
    setDraft(buildDraft());
    setOpen(true);
  };

  const activeCount = countActiveFilters({
    category: searchParams.get("category") ?? undefined,
    size: searchParams.get("size") ?? undefined,
    sleeve: searchParams.get("sleeve") ?? undefined,
    collection: searchParams.get("collection") ?? undefined,
    price: searchParams.get("price") ?? undefined,
    inStock: searchParams.get("inStock") ?? undefined,
  });

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    const setOrDelete = (key: string, value: string) => {
      if (value) params.set(key, value);
      else params.delete(key);
    };
    setOrDelete("category", draft.categories.join(","));
    setOrDelete("size", draft.sizes.join(","));
    setOrDelete("sleeve", draft.sleeve.join(","));
    setOrDelete("collection", draft.collections.join(","));
    setOrDelete("price", draft.price ?? "");
    setOrDelete("inStock", draft.inStock ? "1" : "");
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  const clearAll = () => {
    setDraft({ categories: [], sizes: [], sleeve: [], collections: [], price: undefined, inStock: false });
  };

  return (
    <>
      <Button type="button" variant="outline" onClick={openWithFreshDraft} className="gap-2">
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filter
        {activeCount > 0 && (
          <span className="flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
            {activeCount}
          </span>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="flex max-h-[85vh] flex-col gap-0 rounded-t-[1.75rem] p-0 sm:mx-auto sm:max-w-lg"
        >
          <SheetDragHandle />
          <SheetHeader className="border-b border-border px-5 py-3">
            <SheetTitle>Filter</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5">
            <Accordion
              type="multiple"
              defaultValue={["category", "size", "sleeve", "price", "availability", "collection"]}
            >
              <AccordionItem value="category">
                <AccordionTrigger>Category</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <PillOption
                        key={c}
                        active={draft.categories.includes(c)}
                        onClick={() =>
                          setDraft((d) => ({ ...d, categories: toggle(d.categories, c) }))
                        }
                      >
                        {c}
                      </PillOption>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="size">
                <AccordionTrigger>Size</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((s) => (
                      <PillOption
                        key={s}
                        active={draft.sizes.includes(s)}
                        onClick={() => setDraft((d) => ({ ...d, sizes: toggle(d.sizes, s) }))}
                      >
                        {s}
                      </PillOption>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {sleeveOptions.length > 0 && (
                <AccordionItem value="sleeve">
                  <AccordionTrigger>Sleeve Length</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-wrap gap-2">
                      {sleeveOptions.map((s) => (
                        <PillOption
                          key={s}
                          active={draft.sleeve.includes(s)}
                          onClick={() => setDraft((d) => ({ ...d, sleeve: toggle(d.sleeve, s) }))}
                        >
                          {s}
                        </PillOption>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              <AccordionItem value="price">
                <AccordionTrigger>Price</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {PRICE_BANDS.map((band) => (
                      <PillOption
                        key={band.key}
                        active={draft.price === band.key}
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            price: d.price === band.key ? undefined : band.key,
                          }))
                        }
                      >
                        {band.label}
                      </PillOption>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="availability">
                <AccordionTrigger>Availability</AccordionTrigger>
                <AccordionContent>
                  <PillOption
                    active={draft.inStock}
                    onClick={() => setDraft((d) => ({ ...d, inStock: !d.inStock }))}
                  >
                    In Stock Only
                  </PillOption>
                </AccordionContent>
              </AccordionItem>

              {!hideCollectionFacet && (
                <AccordionItem value="collection">
                  <AccordionTrigger>Collection</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-wrap gap-2">
                      {collections.map((c) => (
                        <PillOption
                          key={c.slug}
                          active={draft.collections.includes(c.slug)}
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              collections: toggle(d.collections, c.slug),
                            }))
                          }
                        >
                          {c.name}
                        </PillOption>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>

          <div className="flex gap-3 border-t border-border px-5 py-4">
            <Button type="button" variant="outline" className="flex-1" onClick={clearAll}>
              Clear All
            </Button>
            <Button type="button" className="flex-1" onClick={apply}>
              Show Results
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
