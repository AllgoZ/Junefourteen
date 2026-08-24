import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "warn";
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-subtle)]">
      <div>
        <p className="text-xs font-medium tracking-[0.04em] text-muted-foreground uppercase">{label}</p>
        <p className="mt-2 text-[1.75rem] leading-none font-medium tracking-tight text-foreground tabular-nums">
          {value}
        </p>
      </div>
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          tone === "warn" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="size-[18px]" aria-hidden="true" strokeWidth={1.75} />
      </div>
    </div>
  );
}
