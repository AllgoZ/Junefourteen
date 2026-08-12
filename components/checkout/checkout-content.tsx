"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CreditCard, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductImage } from "@/components/product/product-image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/components/providers/cart-provider";
import { getShippingEstimate, INDIAN_STATES } from "@/lib/services/shipping";
import { formatPrice } from "@/lib/format";
import type { ShippingEstimateResult } from "@/types/shipping";

interface AddressForm {
  email: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pin: string;
}

const EMPTY_FORM: AddressForm = {
  email: "",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pin: "",
};

function Section({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border py-6 first:pt-0 last:border-0">
      <h2 className="mb-4 flex items-center gap-2.5 text-sm font-medium text-foreground">
        <span className="flex size-6 items-center justify-center rounded-full bg-foreground text-xs text-background">
          {step}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function CheckoutContent() {
  const { items, subtotal } = useCart();
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [delivery, setDelivery] = useState<ShippingEstimateResult | null>(null);
  const [estimating, setEstimating] = useState(false);

  const update = (field: keyof AddressForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setDelivery(null);
  };

  const canEstimateDelivery = form.state && /^\d{6}$/.test(form.pin);

  const estimateDelivery = async () => {
    if (!canEstimateDelivery) return;
    setEstimating(true);
    const result = await getShippingEstimate({ country: "India", state: form.state, pin: form.pin });
    setDelivery(result);
    setEstimating(false);
  };

  const total = subtotal + (delivery?.amount ?? 0);

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your bag is empty."
        description="Add something to your bag before checking out."
        action={
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        }
        className="min-h-[50vh]"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px] lg:gap-16">
      <div>
        <Section step={1} title="Contact">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="checkout-email">Email</Label>
            <Input
              id="checkout-email"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
        </Section>

        <Section step={2} title="Shipping Address">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="checkout-name">Full Name</Label>
              <Input
                id="checkout-name"
                required
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="checkout-phone">Phone</Label>
              <Input
                id="checkout-phone"
                type="tel"
                inputMode="tel"
                required
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="checkout-address1">Address Line 1</Label>
              <Input
                id="checkout-address1"
                required
                value={form.addressLine1}
                onChange={(e) => update("addressLine1", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="checkout-address2">Address Line 2 (optional)</Label>
              <Input
                id="checkout-address2"
                value={form.addressLine2}
                onChange={(e) => update("addressLine2", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="checkout-city">City</Label>
              <Input
                id="checkout-city"
                required
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="checkout-state">State</Label>
              <Select value={form.state} onValueChange={(v) => update("state", v)}>
                <SelectTrigger id="checkout-state" className="w-full">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="checkout-pin">PIN Code</Label>
              <Input
                id="checkout-pin"
                inputMode="numeric"
                maxLength={6}
                required
                value={form.pin}
                onChange={(e) => update("pin", e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>
        </Section>

        <Section step={3} title="Delivery Method">
          {!delivery ? (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">
                Enter your address above to see delivery options.
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={!canEstimateDelivery || estimating}
                onClick={estimateDelivery}
              >
                {estimating ? "Checking…" : "Check Delivery Options"}
              </Button>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-md border border-foreground p-4">
              <Truck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Standard Delivery</p>
                <p className="text-xs text-muted-foreground">
                  {delivery.zoneLabel} · {delivery.etaLabel}
                </p>
              </div>
              <span className="text-sm font-medium tabular-nums">{formatPrice(delivery.amount)}</span>
            </div>
          )}
        </Section>

        <Section step={4} title="Payment">
          <div className="flex items-center gap-3 rounded-md border border-dashed border-border bg-muted/50 p-4">
            <CreditCard className="size-5 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Payment integration coming soon. Cards, UPI, and net banking will be available at
              launch.
            </p>
          </div>
        </Section>
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <h2 className="mb-4 text-sm font-medium text-foreground">Order Summary</h2>
        <div className="flex flex-col divide-y divide-border rounded-md border border-border px-4">
          {items.map((item) => (
            <div key={item.lineId} className="flex items-center gap-3 py-3">
              <div className="relative w-14 shrink-0">
                <ProductImage image={item.image} alt={item.name} aspect="square" className="rounded-sm" />
                <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.size && `Size ${item.size}`}
                  {item.customMeasurements && "Custom Size"}
                </p>
              </div>
              <span className="text-sm tabular-nums">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="tabular-nums">{delivery ? formatPrice(delivery.amount) : "—"}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(total)}</span>
          </div>
        </div>

        <Button
          size="lg"
          className="mt-6 w-full"
          onClick={() =>
            toast.info("This is a prototype — payment integration is coming soon.")
          }
        >
          Place Order
        </Button>
      </div>
    </div>
  );
}
