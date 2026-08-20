import Image from "next/image";
import { cn } from "@/lib/utils";
import { ASPECT_CLASSES, TonalPlaceholder } from "@/components/ui/tonal-placeholder";
import type { ProductImage as ProductImageType } from "@/types/product";

interface ProductImageProps {
  image?: ProductImageType;
  alt: string;
  aspect?: keyof typeof ASPECT_CLASSES;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Renders real photography via next/image once a product has a `src`; until
 * then falls back to a deterministic tonal placeholder seeded by the image's
 * `tone` value so the same product always renders the same placeholder.
 */
export function ProductImage({
  image,
  alt,
  aspect = "portrait",
  className,
  sizes = "(min-width: 1440px) 620px, 50vw",
  priority = false,
}: ProductImageProps) {
  if (image?.src) {
    return (
      <div className={cn("relative w-full overflow-hidden bg-muted", ASPECT_CLASSES[aspect], className)}>
        <Image
          src={image.src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <TonalPlaceholder tone={image?.tone ?? 0.3} aspect={aspect} alt={alt} className={className} />
  );
}
