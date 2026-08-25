import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { CheckoutContent } from "@/components/checkout/checkout-content";
import { verifySession } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { listAddressesForUser } from "@/lib/repositories/addresses";
import { getActiveTaxRate } from "@/lib/services/tax";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const user = await verifySession();
  const [savedAddresses, taxRate] = await Promise.all([
    user ? listAddressesForUser(await createClient(), user.id) : Promise.resolve([]),
    getActiveTaxRate(),
  ]);

  return (
    <Container size="form" className="py-8">
      <h1 className="mb-8 text-2xl font-medium tracking-tight text-foreground sm:text-3xl">Checkout</h1>
      <CheckoutContent savedAddresses={savedAddresses} isSignedIn={Boolean(user)} taxRate={taxRate} />
    </Container>
  );
}
