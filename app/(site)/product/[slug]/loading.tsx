import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/layout/container";

export default function ProductLoading() {
  return (
    <Container className="py-6">
      <Skeleton className="h-3 w-56" />
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <Skeleton className="aspect-[4/5] w-full rounded-xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-4 h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </Container>
  );
}
