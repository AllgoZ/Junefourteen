"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SizeGuideContent } from "@/components/product/size-guide-content";

export function SizeGuideModal({ trigger }: { trigger?: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <button type="button" className="text-sm text-foreground underline underline-offset-4">
            Size Guide
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] gap-5 overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium tracking-tight">Size Guide</DialogTitle>
        </DialogHeader>
        <SizeGuideContent />
      </DialogContent>
    </Dialog>
  );
}
