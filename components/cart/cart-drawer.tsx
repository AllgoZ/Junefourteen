"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CartContent } from "@/components/cart/cart-content";
import { useCart } from "@/components/providers/cart-provider";

export function CartDrawer() {
  const { isOpen, closeCart, itemCount } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-[420px]">
        <SheetHeader className="gap-0.5 border-b border-border px-5 py-4 sm:px-6">
          <SheetTitle>Your Bag</SheetTitle>
          {itemCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          )}
        </SheetHeader>
        <CartContent onCheckout={closeCart} className="pt-2" />
      </SheetContent>
    </Sheet>
  );
}
