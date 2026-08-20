"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProductImage } from "@/components/product/product-image";
import { cn } from "@/lib/utils";
import type { ProductImage as ProductImageType } from "@/types/product";

interface ProductGalleryProps {
  images: ProductImageType[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const goTo = (index: number) => {
    const next = (index + images.length) % images.length;
    setActiveIndex(next);
  };

  const onMobileScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(index);
  };

  return (
    <div>
      {/* Desktop: thumbnail column + main image */}
      <div className="hidden gap-3 md:flex">
        <div className="flex w-16 shrink-0 flex-col gap-3">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === activeIndex}
              className={cn(
                "overflow-hidden rounded-sm border transition-colors",
                i === activeIndex ? "border-foreground" : "border-transparent hover:border-border"
              )}
            >
              <ProductImage image={image} alt="" aspect="portrait" sizes="64px" />
            </button>
          ))}
        </div>

        <div className="group relative flex-1 overflow-hidden rounded-md">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="block w-full cursor-zoom-in overflow-hidden"
            aria-label="Open fullscreen image"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <ProductImage
                  image={images[activeIndex]}
                  alt={`${productName} — image ${activeIndex + 1}`}
                  aspect="portrait"
                  priority
                  className="transition-transform duration-500 group-hover:scale-110"
                />
              </motion.div>
            </AnimatePresence>
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                aria-label="Previous image"
                className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                aria-label="Next image"
                className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="Expand image"
            className="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
          >
            <Expand className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile: swipeable gallery */}
      <div className="relative md:hidden">
        <div
          ref={scrollerRef}
          onScroll={onMobileScroll}
          className="no-scrollbar snap-x-mandatory flex overflow-x-auto"
        >
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="snap-start w-full shrink-0"
              aria-label={`Open fullscreen image ${i + 1}`}
            >
              <ProductImage
                image={image}
                alt={`${productName} — image ${i + 1}`}
                aspect="portrait"
                priority={i === 0}
                sizes="100vw"
              />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <span className="absolute right-3 bottom-3 rounded-full bg-background/85 px-2.5 py-1 text-xs tabular-nums text-foreground backdrop-blur-sm">
            {activeIndex + 1} / {images.length}
          </span>
        )}
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          showCloseButton={false}
          className="h-[100dvh] max-h-none w-screen max-w-none rounded-none border-none bg-black p-0 sm:h-[90vh] sm:w-[90vw] sm:max-w-3xl sm:rounded-xl"
        >
          <DialogTitle className="sr-only">
            {productName} — image {activeIndex + 1} of {images.length}
          </DialogTitle>
          <div className="relative flex h-full flex-col">
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
            <div className="relative flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="h-full"
                >
                  <ProductImage
                    image={images[activeIndex]}
                    alt={`${productName} — image ${activeIndex + 1}`}
                    aspect="portrait"
                    className="h-full"
                    sizes="90vw"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(activeIndex - 1)}
                  aria-label="Previous image"
                  className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(activeIndex + 1)}
                  aria-label="Next image"
                  className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-2.5 py-1 text-xs tabular-nums text-white backdrop-blur-sm">
                  {activeIndex + 1} / {images.length}
                </span>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
