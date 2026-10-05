"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/product/price";
import { ProductImage } from "@/components/product/product-image";
import { WishlistButton } from "@/components/product/wishlist-button";
import { SizeAndFit } from "@/components/product/size-and-fit";
import { SleeveSelector } from "@/components/product/sleeve-selector";
import { PieceSelector } from "@/components/product/piece-selector";
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
  const [pieceIds, setPieceIds] = useState<Set<string>>(
    () => new Set((product.pieces ?? []).filter((p) => p.defaultSelected).map((p) => p.id))
  );
  const [sizeMode, setSizeMode] = useState<"standard" | "custom">("standard");
  const [customMeasurements, setCustomMeasurements] = useState<Partial<CustomMeasurements>>({
    unit: "cm",
  });
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<SelectionErrors>({});

  const inlineButtonRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Persistent "added to your bag" confirmation — replaces the old
  // auto-dismissing toast, which is exactly what made it feel like it
  // "disappeared." Plain useState, no timer: it only ever clears via its
  // own close button or by leaving this product page (the component
  // unmounts on navigation), per the brief. Mutually exclusive with the
  // scroll-triggered sticky bar just below — both are fixed-bottom, so
  // only one shows at a time.
  const [addedToBag, setAddedToBag] = useState<{
    image?: Product["images"][number];
    name: string;
    price: number;
    quantity: number;
  } | null>(null);

  // Add-to-bag/buy-now account-creation popup (mobile number only, see
  // mobile-signup-dialog.tsx) — guests only, and purely additive: the
  // underlying add/checkout action below always happens regardless of
  // whether this dialog is submitted or skipped. What happens once it
  // closes depends on which button opened it: Buy Now always continues to
  // checkout; Add to Bag opens the cart drawer so closing the popup (either
  // way) actually shows the guest their bag instead of leaving them back on
  // the same page with nothing to look at.
  const [mobileSignupOpen, setMobileSignupOpen] = useState(false);
  const pendingActionRef = useRef<"cart" | "checkout" | null>(null);
  const [requestToOrderOpen, setRequestToOrderOpen] = useState(false);
  const [requested, setRequested] = useState(alreadyRequested);

  function handleMobileSignupOpenChange(open: boolean) {
    setMobileSignupOpen(open);
    if (open) return;
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    if (action === "checkout") router.push("/checkout");
    else if (action === "cart") openCart();
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
  const pieces = product.pieces ?? [];
  const hasPieces = pieces.length > 0;

  // Independent of the admin's manual isSoldOut flag (unchanged, still the
  // only thing that swaps in the Request to Order flow below) — this is
  // the numeric stock_quantity reaching 0. undefined only for the
  // historical mock catalog, never for a real product, so the `=== 0`
  // check alone (not `<= 0`) is deliberately the only thing that gates here.
  const isOutOfStock = !product.isSoldOut && product.stockQuantity === 0;
  const isLowStock =
    !product.isSoldOut && !isOutOfStock && product.stockQuantity !== undefined && product.stockQuantity < 10;

  /** Selected pieces in the product's own sort order. */
  const selectedPieces = pieces.filter((p) => pieceIds.has(p.id));
  const displayPrice = hasPieces
    ? selectedPieces.reduce((sum, p) => sum + p.price, 0)
    : product.price;
  const displayCompareAtPrice = hasPieces ? undefined : product.compareAtPrice;

  function togglePiece(id: string) {
    setPieceIds((prev) => {
      // Keep at least one piece selected — unticking the last one is a no-op.
      if (prev.has(id) && prev.size === 1) return prev;
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function buildLine() {
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: displayPrice,
      compareAtPrice: displayCompareAtPrice,
      size: sizeMode === "standard" ? size : undefined,
      sleeve,
      customMeasurements: sizeMode === "custom" ? (customMeasurements as CustomMeasurements) : undefined,
      selectedPieceIds: hasPieces ? selectedPieces.map((p) => p.id) : undefined,
      selectedPieces: hasPieces ? selectedPieces.map((p) => p.name).join(" + ") : undefined,
    };
  }

  function validate(): boolean {
    const nextErrors = validateAddToBagSelection({
      requiresSize: true,
      requiresSleeve,
      requiresPieces: hasPieces,
      pieceCount: pieceIds.size,
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
    if (product.isSoldOut || isOutOfStock || !validate()) return;
    addItem(buildLine(), quantity);
    setAddedToBag({ image: product.images[0], name: product.name, price: displayPrice, quantity });
    setQuantity(1);
    if (!getIsAuthed()) {
      // The cart drawer opening once the popup closes is still its own
      // confirmation for guests — this bar shows underneath/after it either
      // way (submitted or dismissed), same "purely additive" rule the popup
      // already follows for Buy Now.
      pendingActionRef.current = "cart";
      setMobileSignupOpen(true);
    }
  }

  function handleBuyNow() {
    if (product.isSoldOut || isOutOfStock || !validate()) return;
    addItem(buildLine(), quantity);
    if (getIsAuthed()) {
      router.push("/checkout");
    } else {
      pendingActionRef.current = "checkout";
      setMobileSignupOpen(true);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">{product.name}</h1>
        <div className="mt-2">
          <Price price={displayPrice} compareAtPrice={displayCompareAtPrice} size="lg" />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{product.shortDescription}</p>
        {product.isSoldOut ? (
          <p className="mt-3 text-xs font-medium tracking-[0.12em] text-foreground uppercase">
            Sold Out
          </p>
        ) : isOutOfStock ? (
          <p className="mt-3 text-xs font-medium tracking-[0.12em] text-destructive uppercase">
            Out of Stock
          </p>
        ) : (
          isLowStock && (
            <p className="mt-3 text-sm font-medium text-destructive">
              Only {product.stockQuantity} left in stock — order soon
            </p>
          )
        )}
      </div>

      {!product.isSoldOut && (
        <>
          {hasPieces && (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Choose your pieces</p>
              <PieceSelector
                pieces={pieces}
                selected={pieceIds}
                onToggle={togglePiece}
                error={errors.pieces}
              />
            </div>
          )}

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
            <Button size="lg" onClick={handleAddToBag} disabled={isOutOfStock} className={cn("flex-1", PRIMARY_CTA)}>
              {isOutOfStock ? "Out of Stock" : "Add to Bag"}
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
        {!product.isSoldOut && !isOutOfStock && (
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
        {!product.isSoldOut && !isOutOfStock && !addedToBag && showStickyBar && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden"
          >
            <span className="text-sm font-medium text-foreground tabular-nums">
              {formatPrice(displayPrice)}
            </span>
            <Button onClick={handleAddToBag} className={cn("max-w-[240px] flex-1", STICKY_CTA)}>
              Add to Bag
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/*
        Persistent "added to your bag" confirmation. Fixed full-width bar on
        mobile (same slot the sticky Add to Bag bar above uses — the two are
        mutually exclusive, see its condition), a compact floating card
        bottom-right on desktop rather than a bar spanning the whole
        viewport. No auto-dismiss timer anywhere in here on purpose.
      */}
      <AnimatePresence>
        {addedToBag && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background shadow-[var(--shadow-overlay)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[380px] sm:rounded-2xl sm:border sm:pb-4"
          >
            <div className="flex items-center gap-2 px-4 pt-3 pb-1.5 text-foreground sm:px-4 sm:pt-4">
              <CheckCircle2 className="size-4 shrink-0 text-foreground" aria-hidden="true" />
              <span className="text-xs font-medium tracking-[0.08em] uppercase">Added to your bag</span>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setAddedToBag(null)}
                className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex items-center gap-3 px-4 pb-3 sm:pb-4">
              <div className="w-12 shrink-0 overflow-hidden rounded-lg">
                <ProductImage image={addedToBag.image} alt={addedToBag.name} aspect="square" sizes="48px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{addedToBag.name}</p>
                <p className="text-xs text-muted-foreground">
                  Qty {addedToBag.quantity} · {formatPrice(addedToBag.price)}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  openCart();
                  setAddedToBag(null);
                }}
                className="shrink-0 rounded-full"
              >
                View Bag
              </Button>
            </div>
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
