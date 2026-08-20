import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EditorialImage } from "@/components/ui/editorial-image";

interface CampaignImageProps {
  src: string;
  tone: number;
  alt: string;
  /** Omit for a purely visual break — pass only when a destination genuinely helps. */
  link?: { label: string; href: string };
  objectPosition?: string;
}

/**
 * A full-bleed photograph used as a visual beat between grid sections — no
 * heading, no paragraph. At most a single understated corner label
 * (redesign v3 §37: "prefer no text... should feel like the closing frame of
 * a fashion editorial").
 */
export function CampaignImage({ src, tone, alt, link, objectPosition }: CampaignImageProps) {
  const image = (
    <EditorialImage
      src={src}
      tone={tone}
      aspect="cinematic"
      alt={alt}
      decorative={Boolean(link)}
      objectPosition={objectPosition}
      sizes="100vw"
      className="sm:aspect-[21/9]"
    />
  );

  if (!link) return <section>{image}</section>;

  return (
    <Link href={link.href} className="group relative block">
      {image}
      <span className="absolute right-4 bottom-4 flex items-center gap-1.5 text-xs font-medium tracking-[0.2em] text-white uppercase sm:right-8 sm:bottom-6">
        {link.label}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}
