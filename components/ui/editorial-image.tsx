import Image from "next/image";
import { cn } from "@/lib/utils";
import { ASPECT_CLASSES, TonalPlaceholder } from "@/components/ui/tonal-placeholder";

interface EditorialImageProps {
  src?: string;
  tone: number;
  aspect?: keyof typeof ASPECT_CLASSES;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  decorative?: boolean;
  /** CSS object-position, e.g. "50% 20%" to bias a crop toward faces near the top of a tall source photo. */
  objectPosition?: string;
}

/**
 * Same real-photo-with-placeholder-fallback pattern as ProductImage, for
 * non-product editorial imagery (hero, collections, editorial splits, social
 * grid). Renders next/image once a real `src` exists, otherwise the tonal
 * placeholder.
 */
export function EditorialImage({
  src,
  tone,
  aspect = "portrait",
  alt,
  className,
  sizes = "100vw",
  priority = false,
  decorative = false,
  objectPosition,
}: EditorialImageProps) {
  if (src) {
    return (
      <div
        className={cn("relative overflow-hidden bg-muted", ASPECT_CLASSES[aspect], className)}
        {...(decorative ? { "aria-hidden": true } : {})}
      >
        <Image
          src={src}
          alt={decorative ? "" : alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          style={objectPosition ? { objectPosition } : undefined}
        />
      </div>
    );
  }

  return (
    <TonalPlaceholder
      tone={tone}
      aspect={aspect}
      alt={alt}
      className={className}
      decorative={decorative}
    />
  );
}
