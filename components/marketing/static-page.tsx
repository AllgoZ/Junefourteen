import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

interface StaticPageProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function StaticPage({ title, subtitle, children, className }: StaticPageProps) {
  return (
    <Container size="narrow" className={cn("py-12 sm:py-16", className)}>
      <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-3 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground sm:text-base [&_h2]:text-lg [&_h2]:font-medium [&_h2]:text-foreground [&_strong]:text-foreground">
        {children}
      </div>
    </Container>
  );
}
