"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Minus, Plus, Ruler, X } from "lucide-react";
import { ProductImage } from "@/components/product/product-image";
import { Price } from "@/components/product/price";
import { useCart } from "@/components/providers/cart-provider";
import type { CartItem } from "@/types/cart";

export function CartLineItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <motion.div
      layout
      initial={false}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <div className="flex gap-4 py-4">
        <Link href={`/product/${item.slug}`} className="w-20 shrink-0 sm:w-24">
          <ProductImage image={item.image} alt={item.name} aspect="portrait" className="rounded-sm" />
        </Link>

        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/product/${item.slug}`} className="text-sm font-medium text-foreground">
              {item.name}
            </Link>
            <button
              type="button"
              aria-label={`Remove ${item.name} from bag`}
              onClick={() => removeItem(item.lineId)}
              className="flex size-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {item.size && <span>Size {item.size}</span>}
            {item.sleeve && <span>· {item.sleeve}</span>}
            {item.customMeasurements && (
              <span className="inline-flex items-center gap-1 text-foreground">
                <Ruler className="size-3" aria-hidden="true" /> Custom Size
              </span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between pt-2">
            <div className="flex items-center rounded-full border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                className="flex size-8 items-center justify-center text-foreground transition-colors hover:bg-muted"
              >
                <Minus className="size-3.5" aria-hidden="true" />
              </button>
              <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                className="flex size-8 items-center justify-center text-foreground transition-colors hover:bg-muted"
              >
                <Plus className="size-3.5" aria-hidden="true" />
              </button>
            </div>
            <Price price={item.price} compareAtPrice={item.compareAtPrice} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
