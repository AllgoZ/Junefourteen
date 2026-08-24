"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  Image,
  Boxes,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminSignOut } from "@/lib/services/admin-auth";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/collections", label: "Collections", icon: Layers },
  { href: "/admin/banners", label: "Banners", icon: Image },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function SignOutButton({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
  return (
    <form action={adminSignOut} className={className}>
      <button
        type="submit"
        aria-label="Sign Out"
        className={cn(
          "flex items-center gap-2.5 rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          iconOnly ? "size-9 justify-center" : "w-full px-2 py-2 text-left text-sm"
        )}
      >
        <LogOut className="size-[17px] shrink-0" aria-hidden="true" strokeWidth={1.75} />
        {!iconOnly && "Sign Out"}
      </button>
    </form>
  );
}

export function AdminNav({ email }: { email: string | null }) {
  const pathname = usePathname();
  const initial = email?.trim()?.[0]?.toUpperCase() ?? "A";

  return (
    <nav className="sticky top-0 z-20 flex shrink-0 flex-col border-b border-sidebar-border bg-sidebar text-sidebar-foreground lg:h-screen lg:w-64 lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between gap-2.5 px-4 py-3.5 lg:px-5 lg:py-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-[13px] font-semibold text-sidebar-primary-foreground">
            J
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium tracking-tight text-sidebar-foreground">JUNEFOURTEEN</p>
            <p className="text-[11px] tracking-[0.08em] text-muted-foreground uppercase">Admin</p>
          </div>
        </div>
        <SignOutButton className="lg:hidden" iconOnly />
      </div>

      <ul className="flex flex-1 flex-row gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pt-1 lg:pb-3">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
          return (
            <li key={href} className="shrink-0 lg:shrink">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="size-[17px] shrink-0" aria-hidden="true" strokeWidth={1.75} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="hidden border-t border-sidebar-border px-3 py-3 lg:block">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
            {initial}
          </span>
          <p className="min-w-0 flex-1 truncate text-xs text-sidebar-foreground/80">{email}</p>
        </div>
        <SignOutButton className="mt-1" />
      </div>
    </nav>
  );
}
