"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ProductImage } from "@/components/product/product-image";
import { Price } from "@/components/product/price";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { popularSearches } from "@/lib/mock-data/popular-searches";
import { search } from "@/lib/services/search";
import type { SearchResults } from "@/lib/services/search";

interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_RESULTS: SearchResults = { products: [], collections: [] };

export function SearchOverlay({ open, onOpenChange }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const { recent, addRecent, clearRecent } = useRecentSearches();
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      search(query).then((r) => {
        if (!cancelled) setResults(r);
      });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setQuery("");
  };

  const runSearch = (term: string) => {
    addRecent(term);
    handleOpenChange(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const hasQuery = query.trim().length > 0;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="top"
        showCloseButton={false}
        className="h-[100dvh] gap-0 border-none p-0 sm:h-auto sm:max-h-[85vh]"
      >
        <SheetTitle className="sr-only">Search</SheetTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (hasQuery) runSearch(query);
          }}
          className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6"
        >
          <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, collections…"
            aria-label="Search"
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            aria-label="Close search"
            onClick={() => handleOpenChange(false)}
            className="flex size-9 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </form>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {!hasQuery && (
            <div className="flex flex-col gap-6">
              {recent.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Recent Searches
                    </p>
                    <button
                      type="button"
                      onClick={clearRecent}
                      className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => runSearch(term)}
                        className="rounded-full border border-border px-3 py-1.5 text-sm hover:bg-muted"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => runSearch(term)}
                      className="rounded-full border border-border px-3 py-1.5 text-sm hover:bg-muted"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {hasQuery && results.products.length === 0 && results.collections.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;.
            </p>
          )}

          {hasQuery && results.collections.length > 0 && (
            <div className="mb-6">
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Collections
              </p>
              <div className="flex flex-col">
                {results.collections.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/shop?collection=${c.slug}`}
                    onClick={() => runSearch(query)}
                    className="py-2 text-sm text-foreground hover:underline"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {hasQuery && results.products.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Products
              </p>
              <div className="flex flex-col divide-y divide-border">
                {results.products.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    onClick={() => runSearch(query)}
                    className="flex items-center gap-3 py-3"
                  >
                    <ProductImage
                      image={p.images[0]}
                      alt={p.name}
                      aspect="square"
                      className="w-14 shrink-0 rounded-sm"
                    />
                    <span className="flex flex-1 flex-col">
                      <span className="text-sm text-foreground">{p.name}</span>
                      <Price price={p.price} compareAtPrice={p.compareAtPrice} size="sm" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
