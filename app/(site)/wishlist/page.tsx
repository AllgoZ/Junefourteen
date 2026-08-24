import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { WishlistGrid } from "@/components/wishlist/wishlist-grid";
import { getProducts } from "@/lib/services/products";

export const metadata: Metadata = {
  title: "Wishlist",
};

export default async function WishlistPage() {
  const products = await getProducts();

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-medium tracking-tight text-foreground sm:text-3xl">Wishlist</h1>
      <WishlistGrid products={products} />
    </Container>
  );
}
