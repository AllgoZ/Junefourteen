"use client";

import { cn } from "@/lib/utils";
import type { Size } from "@/types/product";

interface SizeSelectorProps {
  sizes: Size[];
  value?: Size;
  onChange: (size: Size) => void;
  error?: string;
}

export function SizeSelector({ sizes, value, onChange, error }: SizeSelectorProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size" aria-invalid={Boolean(error)}>
        {sizes.map((size) => {
          const active = value === size;
          return (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(size)}
              className={cn(
                "flex h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm transition-colors",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:border-foreground/40"
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
