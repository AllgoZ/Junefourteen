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
  /** Quiet uppercase label instead of a large heading — used everywhere except the hero. */
  compact?: boolean;
  /** For placement on the near-black showcase chapter. */
  dark?: boolean;
  /** Skip the heading row entirely — used when a chapter divider already carries the title. */
  hideHeading?: boolean;
}

export function HomeSection({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View All",
  children,
  className,
  headingClassName,
  compact = false,
  dark = false,
  hideHeading = false,
}: HomeSectionProps) {
  return (
    <section className={cn("py-20 sm:py-28 lg:py-32", className)}>
      {!hideHeading && (
        <Container className={cn("mb-6 flex items-end justify-between sm:mb-8", headingClassName)}>
          <div>
            <h2
              className={cn(
                compact
                  ? "text-xs font-medium tracking-[0.25em] uppercase sm:text-sm"
                  : "text-2xl font-medium tracking-tight sm:text-3xl",
                dark ? "text-warm-white" : "text-foreground"
              )}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className={cn(
                  "mt-1.5 max-w-md text-sm",
                  dark ? "text-warm-white/70" : "text-muted-foreground"
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className={cn(
                "flex shrink-0 items-center gap-1 transition-opacity hover:opacity-60",
                compact ? "text-xs tracking-[0.1em] uppercase" : "text-sm",
                dark ? "text-warm-white/80" : "text-foreground"
              )}
            >
              {viewAllLabel} <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          )}
        </Container>
      )}
      {children}
    </section>
  );
}
