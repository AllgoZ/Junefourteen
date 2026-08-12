import { cn } from "@/lib/utils";

const MAX_WIDTH = {
  default: "max-w-[1440px]",
  form: "max-w-5xl",
  medium: "max-w-3xl",
  narrow: "max-w-2xl",
} as const;

interface ContainerProps extends React.ComponentProps<"div"> {
  size?: keyof typeof MAX_WIDTH;
}

/**
 * The single source of horizontal boundaries for the site. Header, hero
 * text, section headings, product grids, and footer all render inside this
 * so their left/right edges line up — utility pages (cart/checkout/account)
 * use the narrower sizes for a tighter reading column without breaking the
 * shared gutter scale.
 */
export function Container({ size = "default", className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-8 lg:px-12", MAX_WIDTH[size], className)}
      {...props}
    />
  );
}
