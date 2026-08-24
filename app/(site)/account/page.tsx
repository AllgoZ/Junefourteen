import type { Metadata } from "next";
import { MapPin, Package, User as UserIcon, Heart } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/layout/container";
import { WishlistSummary } from "@/components/account/wishlist-summary";
import { AccountAuthForms } from "@/components/account/auth-forms";
import { OrdersPanel } from "@/components/account/orders-panel";
import { AddressesPanel } from "@/components/account/addresses-panel";
import { ProfilePanel } from "@/components/account/profile-panel";
import { verifySession, getCurrentProfile } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { listOrdersForUser } from "@/lib/repositories/orders";
import { listAddressesForUser } from "@/lib/repositories/addresses";

export const metadata: Metadata = {
  title: "Account",
};

const ROWS = [
  { value: "orders", icon: Package, label: "Orders" },
  { value: "wishlist", icon: Heart, label: "Wishlist" },
  { value: "addresses", icon: MapPin, label: "Addresses" },
  { value: "profile", icon: UserIcon, label: "Profile" },
] as const;

export default async function AccountPage() {
  const user = await verifySession();

  if (!user) {
    return (
      <Container size="narrow" className="py-8 sm:py-12">
        <h1 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">Account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to view your orders, wishlist, and saved addresses.
        </p>
        <AccountAuthForms />
      </Container>
    );
  }

  const supabase = await createClient();
  const [profile, orders, addresses] = await Promise.all([
    getCurrentProfile(),
    listOrdersForUser(supabase, user.id),
    listAddressesForUser(supabase, user.id),
  ]);

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
              {value === "orders" && <OrdersPanel orders={orders} />}
              {value === "wishlist" && <WishlistSummary />}
              {value === "addresses" && <AddressesPanel addresses={addresses} />}
              {value === "profile" && (
                <ProfilePanel email={user.email ?? ""} fullName={profile?.full_name ?? null} />
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Container>
  );
}
