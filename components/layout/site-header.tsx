"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { site } from "@/lib/config/site";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchOverlay } from "@/components/search/search-overlay";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Container } from "@/components/layout/container";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background tabular-nums">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const pathname = usePathname();

  useEffect(() => {
    // On the homepage the header should stay transparent for the height of
    // the hero (75dvh), not just the first few px of scroll — everywhere
    // else keeps the original small threshold.
    //
    // Deliberately NOT calling onScroll() synchronously on mount: dvh-based
    // layout (the hero's h-[75dvh] plus its negative top margin pulling it
    // under the header) isn't reliably settled the instant this effect
    // runs on a mobile browser — window.innerHeight/scrollY read right at
    // mount can reflect a not-yet-resolved viewport (e.g. before the
    // address bar's collapsed/expanded state is final), which was
    // incorrectly flipping `scrolled` to true on a fresh load at the very
    // top of the page. The initial `scrolled = false` state is already
    // correct for a fresh load; only trust measurements taken from a real
    // scroll event, by which point the browser's viewport has settled.
    const onScroll = () => {
      const threshold = pathname === "/" ? window.innerHeight * 0.7 : 4;
      setScrolled(window.scrollY > threshold);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  /** Transparent, white-on-photo nav over the homepage hero — every other route/scroll state is untouched. */
  const overHero = pathname === "/" && !scrolled;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-colors duration-300",
          overHero
            ? "border-transparent bg-transparent"
            : scrolled
              ? "border-border bg-background/90 backdrop-blur-md"
              : "border-transparent bg-background/70 backdrop-blur-sm"
        )}
      >
        <Container className="grid h-14 grid-cols-3 items-center sm:h-[72px]">
          <div className="flex items-center gap-6 justify-self-start">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className={cn(
                "flex size-10 items-center justify-center -ml-2 md:hidden",
                overHero && "text-white"
              )}
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
            <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
              {site.nav.primary.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "text-sm transition-opacity hover:opacity-60",
                    overHero ? "text-white" : "text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link
            href="/"
            className={cn(
              "justify-self-center truncate font-montserrat text-sm font-semibold tracking-[0.02em] whitespace-nowrap sm:text-lg sm:tracking-[0.06em] lg:text-xl",
              overHero ? "text-white" : "text-foreground"
            )}
          >
            {site.name}
          </Link>

          <div
            className={cn(
              "flex items-center gap-1 justify-self-end sm:gap-2",
              overHero && "text-white"
            )}
          >
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="flex size-10 items-center justify-center"
            >
              <Search className="size-[18px]" aria-hidden="true" />
            </button>
            <Link
              href="/account"
              aria-label="Account"
              className="hidden size-10 items-center justify-center md:flex"
            >
              <User className="size-[18px]" aria-hidden="true" />
            </Link>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative hidden size-10 items-center justify-center md:flex"
            >
              <Heart className="size-[18px]" aria-hidden="true" />
              <CountBadge count={wishlistCount} />
            </Link>
            <button
              type="button"
              onClick={openCart}
              aria-label="Open bag"
              className="relative flex size-10 items-center justify-center"
            >
              <ShoppingBag className="size-[18px]" aria-hidden="true" />
              <CountBadge count={itemCount} />
            </button>
          </div>
        </Container>
      </header>

      <MobileNav open={menuOpen} onOpenChange={setMenuOpen} />
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
      <CartDrawer />
    </>
  );
}
