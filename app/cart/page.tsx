import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { CartContent } from "@/components/cart/cart-content";

export const metadata: Metadata = {
  title: "Your Bag",
};

export default function CartPage() {
  return (
    <Container size="narrow" className="flex min-h-[60vh] flex-col py-8">
      <h1 className="mb-6 text-2xl font-medium tracking-tight text-foreground sm:text-3xl">Your Bag</h1>
      <CartContent variant="page" />
    </Container>
  );
}
