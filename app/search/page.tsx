import type { Metadata } from "next";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ProductGrid } from "@/components/product/product-grid";
import { search } from "@/lib/services/search";

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const query = Array.isArray(q) ? q[0] : (q ?? "");
  const results = query ? await search(query, 24) : { products: [], collections: [] };

  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <SearchIcon className="size-4" aria-hidden="true" />
        {query ? (
          <span>
            {results.products.length} result{results.products.length === 1 ? "" : "s"} for
            &ldquo;<span className="text-foreground">{query}</span>&rdquo;
          </span>
        ) : (
          <span>Search</span>
        )}
      </div>

      {results.collections.length > 0 && (
        <div className="mb-8">
          <p className="mb-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Collections
          </p>
          <div className="flex flex-wrap gap-2">
            {results.collections.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?collection=${c.slug}`}
                className="rounded-full border border-border px-3.5 py-2 text-sm hover:bg-muted"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <ProductGrid
        products={results.products}
        emptyMessage={
          query
            ? `We couldn't find anything for "${query}". Try a different search, or browse the full collection.`
            : "Enter a search term to find products."
        }
      />
    </Container>
  );
}
