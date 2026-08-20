"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/layout/container";
import { HomeSection } from "@/components/home/home-section";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductImage } from "@/components/product/product-image";
import { Price } from "@/components/product/price";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

const OFFWHITE = "#FAF9F6";
const NEAR_BLACK = "#050505";

interface ScrollShowcaseSectionProps {
  colorProducts: Product[];
  blackProducts: Product[];
}

/**
 * Best Sellers (plain, white, unanimated) leading into the Black Edit
 * chapter. The white->black->white morph is scoped to a ref on the Black
 * Edit chapter ALONE (see `BlackChapter` below) rather than the combined
 * container's start-to-end progress — that's deliberate: tying it to the
 * whole section's progress made the transition's timing depend on how tall
 * Best Sellers happened to be, which was letting black bleed in while still
 * scrolling through Best Sellers (user feedback, twice). Scoping the scroll
 * ref to just the Black Edit subtree makes it structurally impossible for
 * the color to start shifting before Black Edit's own content begins.
 */
export function ScrollShowcaseSection({ colorProducts, blackProducts }: ScrollShowcaseSectionProps) {
  return (
    <div>
      <ShowcaseChapter
        title="Best Sellers"
        viewAllHref="/shop?sort=best-selling"
        products={colorProducts}
      />
      <BlackChapter products={blackProducts} />
    </div>
  );
}

/** The all-black chapter — its own near-black environment, own scroll ref, own background morph. */
function BlackChapter({ products }: { products: Product[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [OFFWHITE, NEAR_BLACK, NEAR_BLACK, OFFWHITE]
  );

  if (products.length === 0) return null;
  const active = products[Math.min(activeIndex, products.length - 1)];

  return (
    <motion.div ref={sectionRef} style={{ backgroundColor }} className="py-24 sm:py-32 lg:py-40">
      <div className="flex flex-col items-center gap-5 pb-16 text-center sm:pb-20">
        <span className="text-[11px] tracking-[0.3em] text-warm-white/50 uppercase">The Edit</span>
        <h2 className="text-6xl font-medium tracking-tight text-warm-white sm:text-7xl lg:text-8xl">
          Black Edit
        </h2>
        <Link
          href="/shop?collection=black-edit"
          className="flex items-center gap-1.5 text-xs tracking-[0.2em] text-warm-white/70 uppercase transition-opacity hover:opacity-70"
        >
          View All <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      </div>

      <Container className="hidden lg:grid lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-10 xl:grid-cols-[minmax(0,420px)_1fr] xl:gap-14">
        <div className="sticky top-24 self-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <ProductImage image={active.images[0]} alt={active.name} aspect="portrait" sizes="420px" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col">
          {products.map((product, i) => (
            <ShowcaseRow
              key={product.id}
              product={product}
              active={i === activeIndex}
              onActive={() => setActiveIndex(i)}
              dark
            />
          ))}
        </div>
      </Container>

      <Container className="px-2 sm:px-4 lg:hidden">
        <ProductGrid products={products} dark />
      </Container>
    </motion.div>
  );
}

function ShowcaseChapter({
  title,
  viewAllHref,
  products,
}: {
  title: string;
  viewAllHref: string;
  products: Product[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (products.length === 0) return null;
  const active = products[Math.min(activeIndex, products.length - 1)];

  return (
    <HomeSection title={title} viewAllHref={viewAllHref} compact>
      <Container className="hidden lg:grid lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-10 xl:grid-cols-[minmax(0,420px)_1fr] xl:gap-14">
        <div className="sticky top-24 self-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <ProductImage image={active.images[0]} alt={active.name} aspect="portrait" sizes="420px" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col">
          {products.map((product, i) => (
            <ShowcaseRow
              key={product.id}
              product={product}
              active={i === activeIndex}
              onActive={() => setActiveIndex(i)}
            />
          ))}
        </div>
      </Container>

      <Container className="px-2 sm:px-4 lg:hidden">
        <ProductGrid products={products} />
      </Container>
    </HomeSection>
  );
}

function ShowcaseRow({
  product,
  active,
  onActive,
  dark = false,
}: {
  product: Product;
  active: boolean;
  onActive: () => void;
  dark?: boolean;
}) {
  return (
    <motion.div
      viewport={{ margin: "-45% 0px -45% 0px" }}
      onViewportEnter={onActive}
      className={cn(
        "border-b py-6 transition-opacity duration-300 first:pt-0",
        dark ? "border-warm-white/10" : "border-border",
        active ? "opacity-100" : "opacity-40"
      )}
    >
      <Link href={`/product/${product.slug}`} className="flex items-baseline justify-between gap-4">
        <span className={cn("text-sm", dark ? "text-warm-white" : "text-foreground")}>
          {product.name}
        </span>
        <Price
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          dark={dark}
          showCompareAtPrice={false}
        />
      </Link>
    </motion.div>
  );
}
