import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Package, User as UserIcon, Heart } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { WishlistSummary } from "@/components/account/wishlist-summary";

export const metadata: Metadata = {
  title: "Account",
};

const ROWS = [
  { value: "orders", icon: Package, label: "Orders" },
  { value: "wishlist", icon: Heart, label: "Wishlist" },
  { value: "addresses", icon: MapPin, label: "Addresses" },
  { value: "profile", icon: UserIcon, label: "Profile" },
] as const;

export default function AccountPage() {
  return (
    <Container size="narrow" className="py-8 sm:py-12">
      <h1 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">Account</h1>
      <p className="mt-2 text-sm text-muted-foreground">Welcome to your wardrobe.</p>

      <Accordion type="single" collapsible className="mt-8">
        {ROWS.map(({ value, icon: Icon, label }) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className="py-4 text-sm font-medium text-foreground hover:no-underline">
              <span className="flex items-center gap-3">
                <Icon className="size-[18px] text-muted-foreground" aria-hidden="true" />
                {label}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              {value === "orders" && (
                <EmptyState
                  title="No orders yet"
                  description="Order history and tracking are coming soon. Once you place an order, it will show up here."
                  action={
                    <Button asChild variant="outline" size="sm">
                      <Link href="/shop">Start Shopping</Link>
                    </Button>
                  }
                  className="items-start px-0 py-4 text-left"
                />
              )}
              {value === "wishlist" && <WishlistSummary />}
              {value === "addresses" && (
                <EmptyState
                  title="No saved addresses"
                  description="Saved addresses will let you check out faster. This is coming soon."
                  className="items-start px-0 py-4 text-left"
                />
              )}
              {value === "profile" && (
                <EmptyState
                  title="Profile coming soon"
                  description="Account sign-in and profile management are part of our upcoming release."
                  className="items-start px-0 py-4 text-left"
                />
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Container>
  );
}
