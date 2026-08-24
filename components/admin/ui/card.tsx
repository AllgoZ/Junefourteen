import { cn } from "@/lib/utils";

export function AdminCard({
  title,
  description,
  className,
  children,
}: {
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-subtle)] sm:p-6", className)}>
      {title && <h2 className="text-sm font-medium text-foreground">{title}</h2>}
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      {(title || description) ? <div className="mt-4">{children}</div> : children}
    </div>
  );
}
