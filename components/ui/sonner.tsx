"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          // sonner ships its action button bare (no padding/radius/color of
          // its own) — this was most visible on the "Added to your bag" /
          // View Bag toast, which sits at bottom-center on mobile. Matches
          // the site's own black-pill Button "default" variant instead of
          // inventing a new button style.
          actionButton:
            "!rounded-full !bg-primary !text-primary-foreground !px-3.5 !text-xs !font-medium !shadow-none hover:!bg-foreground-secondary",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
