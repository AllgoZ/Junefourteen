"use client";

import { useActionState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { submitOrderRequestAction, type OrderRequestFormState } from "@/app/(site)/product/actions";
import { site } from "@/lib/config/site";
import type { Size } from "@/types/product";

const INITIAL_STATE: OrderRequestFormState = {};

const TEXTAREA_CLASS =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface RequestToOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  sizes: Size[];
  /** Notifies the PDP's button to switch to "Requested" the moment a submission succeeds — the dialog's own success state doesn't outlive its (re)mount, so the parent needs to know too. */
  onSuccess?: () => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function RequestToOrderDialog({ open, onOpenChange, productId, sizes, onSuccess }: RequestToOrderDialogProps) {
  const [state, action, pending] = useActionState(submitOrderRequestAction, INITIAL_STATE);

  useEffect(() => {
    if (state.success) onSuccess?.();
  }, [state.success, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/*
       * The shared DialogContent primitive (components/ui/dialog.tsx) has no
       * max-height/scroll handling of its own — fine for short dialogs, but
       * this one has six fields and can exceed a mobile viewport (especially
       * with the on-screen keyboard open). Scoped to just this dialog via
       * className, not touching the shared primitive or any other dialog
       * that uses it: capped height + its own scroll, a touch wider for the
       * two-column field pairs below, and flex-col so the header stays
       * visually anchored above the scrolling body rather than scrolling
       * away immediately.
       */}
      <DialogContent className="flex max-h-[85vh] flex-col overflow-y-auto sm:max-w-md">
        {state.success ? (
          <>
            <DialogHeader>
              <DialogTitle>Thank You!</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <p>Your request has been received.</p>
              <p>
                This product is made on request and will be dispatched within 15&ndash;20 days.
              </p>
              <p>
                Our customer executive will contact you shortly to confirm your order and assist you
                with the next steps.
              </p>
              <p className="text-foreground">&mdash; {site.name}</p>
            </div>
            <Button type="button" onClick={() => onOpenChange(false)} className="mt-2 self-start">
              Close
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Request to Order</DialogTitle>
              <DialogDescription>
                This product is currently available on a pre-order basis. Please share your details
                below and our executive will contact you to confirm your order.
              </DialogDescription>
            </DialogHeader>
            <form action={action} className="flex flex-col gap-5">
              <input type="hidden" name="productId" value={productId} />

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rto-name">Name</Label>
                <Input id="rto-name" name="customerName" required autoComplete="name" />
                <FieldError message={state.errors?.customerName} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="rto-phone">Phone Number</Label>
                  <Input id="rto-phone" name="phone" type="tel" inputMode="numeric" placeholder="98765 43210" required autoComplete="tel" />
                  <FieldError message={state.errors?.phone} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="rto-email">Email Address</Label>
                  <Input id="rto-email" name="email" type="email" autoComplete="email" />
                  <FieldError message={state.errors?.email} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="rto-size">Size</Label>
                  <select
                    id="rto-size"
                    name="size"
                    required
                    defaultValue=""
                    className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm text-foreground"
                  >
                    <option value="" disabled>
                      Select a size
                    </option>
                    {sizes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <FieldError message={state.errors?.size} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="rto-quantity">Quantity</Label>
                  <Input id="rto-quantity" name="quantity" type="number" min={1} defaultValue={1} required />
                  <FieldError message={state.errors?.quantity} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rto-address">Delivery Address</Label>
                <textarea id="rto-address" name="deliveryAddress" rows={3} required className={TEXTAREA_CLASS} />
                <FieldError message={state.errors?.deliveryAddress} />
              </div>

              {state.errors?.form && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {state.errors.form}
                </p>
              )}

              <Button type="submit" disabled={pending} size="lg" className="mt-1 h-11 w-full">
                {pending ? "Submitting…" : "Submit Order Request"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
