import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/layout/container";

export default function AccountLoading() {
  return (
    <Container size="narrow" className="py-8 sm:py-12">
      <Skeleton className="h-8 w-32 sm:h-9 sm:w-40" />
      <Skeleton className="mt-2 h-4 w-56" />

      <div className="mt-8 flex flex-col gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-border py-4">
            <Skeleton className="size-[18px] shrink-0 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </Container>
  );
}
