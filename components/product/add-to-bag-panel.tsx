"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/product/price";
import { WishlistButton } from "@/components/product/wishlist-button";
import { SizeAndFit } from "@/components/product/size-and-fit";
import { SleeveSelector } from "@/components/product/sleeve-selector";
import { useCart } from "@/components/providers/cart-provider";
import { validateAddToBagSelection, hasSelectionErrors, type SelectionErrors } from "@/lib/validation";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getIsAuthed } from "@/lib/auth/client-auth-store";
import { MobileSignupDialog } from "@/components/account/mobile-signup-dialog";
import { RequestToOrderDialog } from "@/components/product/request-to-order-dialog";
import type { CustomMeasurements, Product, Size, SleeveOption } from "@/types/product";

/**
 * iOS-style elevated CTA treatment — soft top highlight + drop shadow for
 * depth, and a scale-down press state for tactile feedback. Reserved for the
 * strongest actions on the page (Add to Bag / Buy Now) per the design brief.
 */
const PRIMARY_CTA =
  "h-14 rounded-2xl text-base shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),0_14px_30px_-10px_rgba(0,0,0,0.5)] transition-[transform,box-shadow,background-color] duration-150 ease-out hover:bg-foreground-secondary active:scale-[0.97] active:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_4px_14px_-6px_rgba(0,0,0,0.4)]";
const SECONDARY_CTA =
  "h-14 rounded-2xl text-base border-foreground/15 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.25)] transition-[transform,box-shadow] duration-150 ease-out active:scale-[0.97] active:shadow-[0_3px_10px_-6px_rgba(0,0,0,0.15)]";
const STICKY_CTA =
  "h-12 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),0_10px_24px_-10px_rgba(0,0,0,0.5)] transition-[transform,box-shadow,background-color] duration-150 ease-out hover:bg-foreground-secondary active:scale-[0.97] active:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_3px_10px_-6px_rgba(0,0,0,0.4)]";

export function AddToBagPanel({
  product,
  alreadyRequested = false,
}: {
  product: Product;
  /** Whether the signed-in customer already has a pending request for this product — determined server-side (§ page.tsx) so it's correct on a fresh load, not just for the current browser session. */
  alreadyRequested?: boolean;
}) {
  const router = useRouter();
  const { addItem, openCart } = useCart();

  const [size, setSize] = useState<Size | undefined>();
  const [sleeve, setSleeve] = useState<SleeveOption | undefined>();
  const [sizeMode, setSizeMode] = useState<"standard" | "custom">("standard");
  const [customMeasurements, setCustomMeasurements] = useState<Partial<CustomMeasurements>>({
    unit: "cm",
  });
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<SelectionErrors>({});

  const inlineButtonRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Add-to-bag/buy-now account-creation popup (mobile number only, see
  // mobile-signup-dialog.tsx) — guests only, and purely additive: the
  // underlying add/checkout action below always happens regardless of
  // whether this dialog is submitted or skipped.
  const [mobileSignupOpen, setMobileSignupOpen] = useState(false);
  const pendingCheckoutRef = useRef(false);
  const [requestToOrderOpen, setRequestToOrderOpen] = useState(false);
  const [requested, setRequested] = useState(alreadyRequested);

  function handleMobileSignupOpenChange(open: boolean) {
    setMobileSignupOpen(open);
    if (!open && pendingCheckoutRef.current) {
      pendingCheckoutRef.current = false;
      router.push("/checkout");
    }
  }

  useEffect(() => {
    const el = inlineButtonRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), {
      rootMargin: "-1px 0px 0px 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const requiresSleeve = Boolean(product.sleeveOptions?.length);

  function buildLine() {
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      size: sizeMode === "standard" ? size : undefined,
      sleeve,
      customMeasurements: sizeMode === "custom" ? (customMeasurements as CustomMeasurements) : undefined,
    };
  }

  function validate(): boolean {
    const nextErrors = validateAddToBagSelection({
      requiresSize: true,
      requiresSleeve,
      sizeMode,
      size,
      sleeve,
      customMeasurements,
    });
    setErrors(nextErrors);
    if (hasSelectionErrors(nextErrors)) {
      toast.error("Please complete your selection before continuing.");
      return false;
    }
    return true;
  }

  function handleAddToBag() {
    if (product.isSoldOut || !validate()) return;
    addItem(buildLine(), quantity);
    setQuantity(1);
    toast.success(`${product.name} added to your bag.`, {
      action: { label: "View Bag", onClick: openCart },
    });
    if (!getIsAuthed()) setMobileSignupOpen(true);
  }

  function handleBuyNow() {
    if (product.isSoldOut || !validate()) return;
    addItem(buildLine(), quantity);
    if (getIsAuthed()) {
      router.push("/checkout");
    } else {
      pendingCheckoutRef.current = true;
      setMobileSignupOpen(true);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">{product.name}</h1>
        <div className="mt-2">
          <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{product.shortDescription}</p>
        {product.isSoldOut && (
          <p className="mt-3 text-xs font-medium tracking-[0.12em] text-foreground uppercase">
            Sold Out
          </p>
        )}
      </div>

      {!product.isSoldOut && (
        <>
          <SizeAndFit
            product={product}
            sizeMode={sizeMode}
            onSizeModeChange={setSizeMode}
            size={size}
            onSizeChange={setSize}
            customMeasurements={customMeasurements}
            onCustomMeasurementsChange={setCustomMeasurements}
            errors={errors}
          />

          {requiresSleeve && (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Sleeve Length</p>
              <SleeveSelector
                options={product.sleeveOptions!}
                value={sleeve}
                onChange={setSleeve}
                error={errors.sleeve}
              />
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Quantity</p>
            <div className="flex w-fit items-center rounded-full border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex size-11 items-center justify-center text-foreground hover:bg-muted"
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex size-11 items-center justify-center text-foreground hover:bg-muted"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}

      <div ref={inlineButtonRef} className="flex flex-col gap-3">
        {product.isSoldOut ? (
          <Button
            size="lg"
            onClick={() => setRequestToOrderOpen(true)}
            className={cn("h-14 w-full rounded-2xl text-base", PRIMARY_CTA)}
          >
            {requested ? "Requested" : "Request to Order"}
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button size="lg" onClick={handleAddToBag} className={cn("flex-1", PRIMARY_CTA)}>
              Add to Bag
            </Button>
            <WishlistButton
              variant="detail"
              item={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                image: product.images[0],
                isSoldOut: product.isSoldOut,
              }}
              className="size-14 shrink-0 rounded-2xl"
            />
          </div>
        )}
        {!product.isSoldOut && (
          <Button
            size="lg"
            variant="outline"
            onClick={handleBuyNow}
            className={cn("w-full", SECONDARY_CTA)}
          >
            Buy Now
          </Button>
        )}
      </div>

      <AnimatePresence>
        {!product.isSoldOut && showStickyBar && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden"
          >
            <span className="text-sm font-medium text-foreground tabular-nums">
              {formatPrice(product.price)}
            </span>
            <Button onClick={handleAddToBag} className={cn("max-w-[240px] flex-1", STICKY_CTA)}>
              Add to Bag
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileSignupDialog open={mobileSignupOpen} onOpenChange={handleMobileSignupOpenChange} />
      {product.isSoldOut && (
        <RequestToOrderDialog
          open={requestToOrderOpen}
          onOpenChange={setRequestToOrderOpen}
          productId={product.id}
          sizes={product.sizes}
          onSuccess={() => setRequested(true)}
        />
      )}
    </div>
  );
}
