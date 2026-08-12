"use client";

import { Ruler } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ALL_MEASUREMENT_FIELDS } from "@/lib/mock-data/measurement-fields";

export function HowToMeasureModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm text-foreground underline underline-offset-4"
        >
          <Ruler className="size-3.5" aria-hidden="true" /> How to measure?
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] gap-5 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium tracking-tight">How to Measure</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Use a soft measuring tape and keep it snug but not tight. Measuring over close-fitting
          clothing gives the most accurate result.
        </p>
        <ul className="flex flex-col divide-y divide-border">
          {ALL_MEASUREMENT_FIELDS.map((field) => (
            <li key={field.key} className="flex items-center gap-4 py-3">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-muted">
                <Ruler className="size-5 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{field.label}</p>
                <p className="text-xs text-muted-foreground">{field.hint}</p>
              </div>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
