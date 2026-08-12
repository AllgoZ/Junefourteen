"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";

interface ProductRailProps {
  products: Product[];
}

export function ProductRail({ products }: ProductRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="no-scrollbar snap-x-mandatory flex gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:gap-5 sm:scroll-px-8 sm:px-8 lg:scroll-px-12 lg:px-12"
      >
        {products.map((product, i) => (
          <div
            key={product.id}
            className="snap-start w-[62vw] shrink-0 sm:w-[38vw] md:w-[28vw] lg:w-[22vw]"
          >
            <ProductCard product={product} priority={i < 2} />
          </div>
        ))}
      </div>

      <div className="mt-2 hidden justify-end gap-2 lg:flex lg:px-12">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Scroll previous"
          onClick={() => scrollByAmount(-1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Scroll next"
          onClick={() => scrollByAmount(1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
