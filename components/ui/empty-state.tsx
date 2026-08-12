import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Typography-first — no big centered icon-in-a-circle, just a headline, one line, and a clear CTA. */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4 px-6 py-20 text-center", className)}>
      <div className="flex flex-col gap-1.5">
        <p className="text-lg font-medium tracking-tight text-foreground">{title}</p>
        {description && (
          <p className="max-w-xs text-sm text-balance text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
