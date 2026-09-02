"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import cloudinaryLoader from "@/lib/cloudinary/loader";
import { SizeGuideContent } from "@/components/product/size-guide-content";

export function SizeGuideModal({
  trigger,
  image,
}: {
  trigger?: React.ReactNode;
  /** When set, the popup shows this uploaded chart instead of the generic table. */
  image?: { src: string; alt: string };
}) {
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
        {image ? (
          <Image
            loader={cloudinaryLoader}
            src={image.src}
            alt={image.alt || "Size chart"}
            width={1000}
            height={1400}
            sizes="(min-width: 640px) 36rem, 90vw"
            className="h-auto w-full rounded-md"
          />
        ) : (
          <SizeGuideContent />
        )}
      </DialogContent>
    </Dialog>
  );
}
