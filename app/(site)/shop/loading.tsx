import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { Container } from "@/components/layout/container";

export default function ShopLoading() {
  return (
    <Container className="py-6">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-4 h-9 w-48" />
      <Skeleton className="mt-3 h-4 w-72" />
      <div className="mt-6 flex items-center justify-between border-b border-border py-4">
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      <div className="pt-8">
        <ProductGridSkeleton />
      </div>
    </Container>
  );
}
