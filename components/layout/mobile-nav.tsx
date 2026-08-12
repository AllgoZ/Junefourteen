"use client";

import Link from "next/link";
import { Heart, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { site } from "@/lib/config/site";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full gap-0 p-0 sm:max-w-xs">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="font-serif text-lg tracking-wide">{site.name}</SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col px-5 py-4" aria-label="Mobile">
          {site.nav.primary.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => onOpenChange(false)}
              className="border-b border-border py-4 text-base text-foreground"
            >
              {link.label}
            </Link>
          ))}

          <Separator className="my-2" />

          <Link
            href="/account"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 py-3 text-sm text-foreground"
          >
            <User className="size-4" aria-hidden="true" /> Account
          </Link>
          <Link
            href="/wishlist"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 py-3 text-sm text-foreground"
          >
            <Heart className="size-4" aria-hidden="true" /> Wishlist
          </Link>
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-border px-5 py-4 text-sm text-muted-foreground">
          <Link href="/about" onClick={() => onOpenChange(false)} className="py-1.5">
            About
          </Link>
          <Link href="/contact" onClick={() => onOpenChange(false)} className="py-1.5">
            Contact
          </Link>
          <Link href="/faq" onClick={() => onOpenChange(false)} className="py-1.5">
            FAQs
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
