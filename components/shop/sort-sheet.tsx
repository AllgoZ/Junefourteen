"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SheetDragHandle } from "@/components/ui/sheet-drag-handle";
import { Button } from "@/components/ui/button";
import { SORT_OPTIONS } from "@/lib/shop-filters";
import { cn } from "@/lib/utils";

export function SortSheet() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const current = searchParams.get("sort") ?? "featured";

  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") params.delete("sort");
    else params.set("sort", value);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <ArrowUpDown className="size-4" aria-hidden="true" />
        Sort
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="gap-0 rounded-t-[1.75rem] p-0 sm:mx-auto sm:max-w-lg"
        >
          <SheetDragHandle />
          <SheetHeader className="border-b border-border px-5 py-3">
            <SheetTitle>Sort By</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col px-2 py-2">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => select(option.value)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-3 text-left text-sm",
                  current === option.value ? "text-foreground" : "text-foreground/80 hover:bg-muted"
                )}
              >
                {option.label}
                {current === option.value && <Check className="size-4" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
