import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

interface HomeSectionProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: React.ReactNode;
  className?: string;
  headingClassName?: string;
}

export function HomeSection({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View All",
  children,
  className,
  headingClassName,
}: HomeSectionProps) {
  return (
    <section className={cn("py-14 sm:py-20", className)}>
      <Container className={cn("mb-6 flex items-end justify-between sm:mb-8", headingClassName)}>
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="hidden shrink-0 items-center gap-1 text-sm text-foreground transition-opacity hover:opacity-60 sm:flex"
          >
            {viewAllLabel} <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        )}
      </Container>
      {children}
      {viewAllHref && (
        <Container className="mt-6 sm:hidden">
          <Link href={viewAllHref} className="flex items-center gap-1 text-sm text-foreground">
            {viewAllLabel} <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </Container>
      )}
    </section>
  );
}
