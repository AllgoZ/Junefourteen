"use client";

import { cn } from "@/lib/utils";
import type { SleeveOption } from "@/types/product";

interface SleeveSelectorProps {
  options: SleeveOption[];
  value?: SleeveOption;
  onChange: (option: SleeveOption) => void;
  error?: string;
}

export function SleeveSelector({ options, value, onChange, error }: SleeveSelectorProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Sleeve Length" aria-invalid={Boolean(error)}>
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option)}
              className={cn(
                "flex h-11 items-center justify-center rounded-full border px-4 text-sm transition-colors",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:border-foreground/40"
              )}
            >
              {option}
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
