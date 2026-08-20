"use client";

import Link from "next/link";
import { Heart, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { site } from "@/lib/config/site";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HELP_LINKS = [
  { label: "Shipping", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "Contact", href: "/contact" },
  { label: "FAQs", href: "/faq" },
];

/** Same quiet uppercase-tracked label style as the homepage's compact section headings (e.g. "COLLECTIONS", "NEW ARRIVALS"). */
const ITEM_CLASS = "text-xs font-medium tracking-[0.2em] text-foreground uppercase";

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-full flex-col gap-0 p-0 sm:max-w-xs">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="font-montserrat text-lg font-semibold tracking-[0.06em]">
            {site.name}
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-1 flex-col overflow-y-auto px-5 py-2" aria-label="Mobile">
          <Link
            href="/shop?sort=newest"
            onClick={close}
            className={`${ITEM_CLASS} border-b border-border py-4`}
          >
            New Arrivals
          </Link>

          <Accordion type="single" collapsible>
            <AccordionItem value="shop">
              <AccordionTrigger className={`${ITEM_CLASS} py-4 hover:no-underline`}>
                Shop
              </AccordionTrigger>
              <AccordionContent className="[&_a]:no-underline">
                <div className="flex flex-col gap-1 pb-2">
                  {site.nav.shop.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={close}
                      className="py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="about">
              <AccordionTrigger className={`${ITEM_CLASS} py-4 hover:no-underline`}>
                About
              </AccordionTrigger>
              <AccordionContent className="[&_a]:no-underline">
                <div className="flex flex-col gap-1 pb-2">
                  {site.nav.about.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={close}
                      className="py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="help">
              <AccordionTrigger className={`${ITEM_CLASS} py-4 hover:no-underline`}>
                Help
              </AccordionTrigger>
              <AccordionContent className="[&_a]:no-underline">
                <div className="flex flex-col gap-1 pb-2">
                  {HELP_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={close}
                      className="py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Link
            href="/shop"
            onClick={close}
            className={`${ITEM_CLASS} border-t border-b border-border py-4`}
          >
            Collections
          </Link>

          <Separator className="my-2" />

          <Link href="/account" onClick={close} className={`${ITEM_CLASS} flex items-center gap-3 py-3`}>
            <User className="size-4" aria-hidden="true" /> Account
          </Link>
          <Link href="/wishlist" onClick={close} className={`${ITEM_CLASS} flex items-center gap-3 py-3`}>
            <Heart className="size-4" aria-hidden="true" /> Wishlist
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
