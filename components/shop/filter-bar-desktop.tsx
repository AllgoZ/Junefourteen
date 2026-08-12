"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PRICE_BANDS, SORT_OPTIONS, type PriceBandKey } from "@/lib/shop-filters";
import { SIZES } from "@/types/product";
import type { Collection, SleeveOption } from "@/types/product";
import { cn } from "@/lib/utils";

interface FilterBarDesktopProps {
  categories: string[];
  sleeveOptions: SleeveOption[];
  collections: Collection[];
  hideCollectionFacet?: boolean;
}

function splitParam(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

function FacetTrigger({ label, active }: { label: string; active: boolean }) {
  return (
    <PopoverTrigger asChild>
      <button
        type="button"
        className={cn(
          "flex items-center gap-1 text-sm transition-colors",
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {label}
        <ChevronDown className="size-3.5" aria-hidden="true" />
      </button>
    </PopoverTrigger>
  );
}

function FacetOption({
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
        "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
        active ? "bg-muted text-foreground" : "text-foreground/80 hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}

export function FilterBarDesktop({
  categories,
  sleeveOptions,
  collections,
  hideCollectionFacet,
}: FilterBarDesktopProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategories = splitParam(searchParams.get("category"));
  const selectedSizes = splitParam(searchParams.get("size"));
  const selectedSleeve = splitParam(searchParams.get("sleeve"));
  const selectedCollections = splitParam(searchParams.get("collection"));
  const selectedPrice = searchParams.get("price") as PriceBandKey | null;
  const inStockOnly = searchParams.get("inStock") === "1";
  const sort = searchParams.get("sort") ?? "featured";

  const pushParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleListParam = (key: string, value: string, current: string[]) => {
    pushParams((params) => {
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (next.length) params.set(key, next.join(","));
      else params.delete(key);
    });
  };

  const setPrice = (band: PriceBandKey) => {
    pushParams((params) => {
      if (selectedPrice === band) params.delete("price");
      else params.set("price", band);
    });
  };

  const setSort = (value: string) => {
    pushParams((params) => {
      if (value === "featured") params.delete("sort");
      else params.set("sort", value);
    });
  };

  const toggleInStock = () => {
    pushParams((params) => {
      if (inStockOnly) params.delete("inStock");
      else params.set("inStock", "1");
    });
  };

  const activeCount =
    selectedCategories.length +
    selectedSizes.length +
    selectedSleeve.length +
    selectedCollections.length +
    (selectedPrice ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Popover>
          <FacetTrigger label="Category" active={selectedCategories.length > 0} />
          <PopoverContent align="start" className="w-56">
            {categories.map((c) => (
              <FacetOption
                key={c}
                active={selectedCategories.includes(c)}
                onClick={() => toggleListParam("category", c, selectedCategories)}
              >
                {c}
              </FacetOption>
            ))}
          </PopoverContent>
        </Popover>

        <Popover>
          <FacetTrigger label="Size" active={selectedSizes.length > 0} />
          <PopoverContent align="start" className="w-48">
            {SIZES.map((s) => (
              <FacetOption
                key={s}
                active={selectedSizes.includes(s)}
                onClick={() => toggleListParam("size", s, selectedSizes)}
              >
                {s}
              </FacetOption>
            ))}
          </PopoverContent>
        </Popover>

        {sleeveOptions.length > 0 && (
          <Popover>
            <FacetTrigger label="Sleeve" active={selectedSleeve.length > 0} />
            <PopoverContent align="start" className="w-56">
              {sleeveOptions.map((s) => (
                <FacetOption
                  key={s}
                  active={selectedSleeve.includes(s)}
                  onClick={() => toggleListParam("sleeve", s, selectedSleeve)}
                >
                  {s}
                </FacetOption>
              ))}
            </PopoverContent>
          </Popover>
        )}

        <Popover>
          <FacetTrigger label="Price" active={Boolean(selectedPrice)} />
          <PopoverContent align="start" className="w-56">
            {PRICE_BANDS.map((band) => (
              <FacetOption key={band.key} active={selectedPrice === band.key} onClick={() => setPrice(band.key)}>
                {band.label}
              </FacetOption>
            ))}
          </PopoverContent>
        </Popover>

        {!hideCollectionFacet && (
          <Popover>
            <FacetTrigger label="Collection" active={selectedCollections.length > 0} />
            <PopoverContent align="start" className="w-56">
              {collections.map((c) => (
                <FacetOption
                  key={c.slug}
                  active={selectedCollections.includes(c.slug)}
                  onClick={() => toggleListParam("collection", c.slug, selectedCollections)}
                >
                  {c.name}
                </FacetOption>
              ))}
            </PopoverContent>
          </Popover>
        )}

        <Popover>
          <FacetTrigger label="Availability" active={inStockOnly} />
          <PopoverContent align="start" className="w-48">
            <FacetOption active={inStockOnly} onClick={toggleInStock}>
              In Stock Only
            </FacetOption>
          </PopoverContent>
        </Popover>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => router.push(pathname)}
            className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Clear all
          </button>
        )}
      </div>

      <Popover>
        <FacetTrigger label={SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort"} active={sort !== "featured"} />
        <PopoverContent align="end" className="w-52">
          {SORT_OPTIONS.map((option) => (
            <FacetOption key={option.value} active={sort === option.value} onClick={() => setSort(option.value)}>
              {option.label}
            </FacetOption>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
