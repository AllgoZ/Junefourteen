import Link from "next/link";
import { EditorialImage } from "@/components/ui/editorial-image";
import { cn } from "@/lib/utils";

interface EditorialSplitProps {
  eyebrow?: string;
  title: string;
  body: string;
  imageSrc?: string;
  imageTone: number;
  imageAlt: string;
  imageSide?: "left" | "right";
  cta?: { label: string; href: string };
  className?: string;
}

export function EditorialSplit({
  eyebrow,
  title,
  body,
  imageSrc,
  imageTone,
  imageAlt,
  imageSide = "left",
  cta,
  className,
}: EditorialSplitProps) {
  return (
    <section className={cn("grid grid-cols-1 lg:grid-cols-2", className)}>
      <div className={cn(imageSide === "right" && "lg:order-2")}>
        <EditorialImage
          src={imageSrc}
          tone={imageTone}
          aspect="wide"
          alt={imageAlt}
          decorative
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="lg:h-full lg:aspect-auto"
        />
      </div>
      <div className="flex flex-col items-start justify-center gap-4 px-6 py-14 sm:px-10 sm:py-20 lg:px-16">
        {eyebrow && (
          <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
        )}
        <h2 className="max-w-md font-serif text-3xl text-foreground sm:text-4xl">{title}</h2>
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">{body}</p>
        {cta && (
          <Link
            href={cta.href}
            className="mt-2 text-sm font-medium text-foreground underline underline-offset-4"
          >
            {cta.label}
          </Link>
        )}
      </div>
    </section>
  );
}
