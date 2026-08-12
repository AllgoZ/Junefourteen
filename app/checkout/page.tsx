import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { CheckoutContent } from "@/components/checkout/checkout-content";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <Container size="form" className="py-8">
      <h1 className="mb-8 text-2xl font-medium tracking-tight text-foreground sm:text-3xl">Checkout</h1>
      <CheckoutContent />
    </Container>
  );
}
