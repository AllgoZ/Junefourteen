import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "../(site)/globals.css";

/**
 * Separate root layout (own <html>/<body>) via Next's route-groups
 * mechanism — see (site)/layout.tsx for the storefront's root layout. This
 * is what keeps admin free of SiteHeader/SiteFooter/CartProvider/
 * WishlistProvider: those never mount for any /admin/* request, so their
 * client JS, auth listeners, and cart/wishlist fetches never run here
 * either (backend brief §32 — admin must not burden the storefront bundle,
 * and vice versa). Reuses the storefront's globals.css for the same
 * Tailwind v4 tokens/utilities rather than duplicating the design system.
 */
const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | JUNEFOURTEEN Admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-muted font-sans antialiased" suppressHydrationWarning>
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
