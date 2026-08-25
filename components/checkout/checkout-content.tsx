"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CreditCard, Truck, Tag, X } from "lucide-react";
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
import { INDIAN_STATES } from "@/lib/config/indian-states";
import {
  createOrderAction,
  verifyRazorpayPaymentAction,
  estimateShippingAction,
  applyCouponAction,
} from "@/app/(site)/checkout/actions";
import { loadRazorpayCheckout, type RazorpaySuccessResponse } from "@/lib/payments/razorpay-client";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/config/site";
import type { ShippingEstimateResult } from "@/types/shipping";
import type { AddressRow } from "@/lib/repositories/addresses";

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

interface PendingOrder {
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
}

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

export function CheckoutContent({
  savedAddresses,
  isSignedIn,
  taxRate,
}: {
  savedAddresses: AddressRow[];
  isSignedIn: boolean;
  taxRate: { ratePercent: number; label: string } | null;
}) {
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [delivery, setDelivery] = useState<ShippingEstimateResult | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [saveAddress, setSaveAddress] = useState(true);
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const update = (field: keyof AddressForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setDelivery(null);
  };

  const applySavedAddress = (id: string) => {
    setSelectedAddressId(id);
    const address = savedAddresses.find((a) => a.id === id);
    if (!address) return;
    setForm((f) => ({
      ...f,
      fullName: address.full_name,
      phone: address.phone,
      addressLine1: address.address_line_1,
      addressLine2: address.address_line_2 ?? "",
      city: address.city,
      state: address.state,
      pin: address.postal_code,
    }));
    setDelivery(null);
  };

  const canEstimateDelivery = form.state && /^\d{6}$/.test(form.pin);

  const estimateDelivery = async () => {
    if (!canEstimateDelivery) return;
    setEstimating(true);
    const result = await estimateShippingAction({ country: "India", state: form.state, pin: form.pin, orderSubtotal: subtotal });
    setDelivery(result);
    setEstimating(false);
  };

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponError(null);
    const result = await applyCouponAction(couponInput, subtotal);
    setApplyingCoupon(false);

    if (result.error || result.discountAmount == null || !result.code) {
      setCouponError(result.error ?? "This coupon code isn't valid.");
      return;
    }
    setAppliedCoupon({ code: result.code, discountAmount: result.discountAmount });
    setCouponInput("");
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxRate ? Math.round(taxableAmount * (taxRate.ratePercent / 100) * 100) / 100 : 0;
  const total = taxableAmount + (delivery?.amount ?? 0) + taxAmount;

  const openRazorpayCheckout = async (order: PendingOrder) => {
    setPlacing(true);
    const loaded = await loadRazorpayCheckout();
    if (!loaded || !window.Razorpay) {
      setPlacing(false);
      toast.error("Could not load the payment form. Please check your connection and try again.");
      return;
    }

    const checkout = new window.Razorpay({
      key: order.razorpayKeyId,
      amount: order.amount,
      currency: "INR",
      name: site.name,
      description: `Order ${order.orderNumber}`,
      order_id: order.razorpayOrderId,
      prefill: { name: form.fullName, email: form.email, contact: form.phone },
      theme: { color: "#0A0A0A" },
      handler: (response: RazorpaySuccessResponse) => {
        void (async () => {
          try {
            const result = await verifyRazorpayPaymentAction({
              orderId: order.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (result.error) {
              toast.error(result.error);
              setPlacing(false);
              return;
            }
            clearCart();
            setPlacing(false);
            setOrderNumber(result.orderNumber ?? null);
          } catch {
            toast.error("Could not confirm your payment. Please contact support if you were charged.");
            setPlacing(false);
          }
        })();
      },
      modal: {
        ondismiss: () => setPlacing(false),
      },
    });

    checkout.open();
  };

  const placeOrder = async () => {
    if (pendingOrder) {
      await openRazorpayCheckout(pendingOrder);
      return;
    }

    setPlacing(true);
    const result = await createOrderAction(
      items.map(({ productId, size, sleeve, customMeasurements, quantity }) => ({
        productId,
        size,
        sleeve,
        customMeasurements,
        quantity,
      })),
      { ...form },
      { saveAddress: isSignedIn && saveAddress, couponCode: appliedCoupon?.code }
    );

    if (result.error || !result.orderId || !result.razorpayOrderId || !result.razorpayKeyId || result.amount == null) {
      setPlacing(false);
      toast.error(result.error ?? "Could not start checkout. Please try again.");
      return;
    }

    const next: PendingOrder = {
      orderId: result.orderId,
      orderNumber: result.orderNumber ?? "",
      razorpayOrderId: result.razorpayOrderId,
      razorpayKeyId: result.razorpayKeyId,
      amount: result.amount,
    };
    setPendingOrder(next);
    await openRazorpayCheckout(next);
  };

  if (orderNumber) {
    return (
      <EmptyState
        title="Order placed."
        description={`Order ${orderNumber} is confirmed — payment received.`}
        action={
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        }
        className="min-h-[50vh]"
      />
    );
  }

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
          {savedAddresses.length > 0 && (
            <div className="mb-4 flex flex-col gap-1.5">
              <Label htmlFor="checkout-saved-address">Use a saved address</Label>
              <Select value={selectedAddressId} onValueChange={applySavedAddress}>
                <SelectTrigger id="checkout-saved-address" className="w-full">
                  <SelectValue placeholder="Choose a saved address, or enter a new one below" />
                </SelectTrigger>
                <SelectContent>
                  {savedAddresses.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.full_name} — {a.address_line_1}, {a.city}
                      {a.is_default ? " (Default)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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

          {isSignedIn && (
            <label className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="size-4 rounded border-input accent-foreground"
              />
              Save this address for next time
            </label>
          )}
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

        <Section step={4} title="Coupon">
          {appliedCoupon ? (
            <div className="flex items-center gap-3 rounded-md border border-foreground p-4">
              <Tag className="size-4 shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{appliedCoupon.code}</p>
                <p className="text-xs text-muted-foreground">−{formatPrice(appliedCoupon.discountAmount)} applied</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={removeCoupon} aria-label="Remove coupon">
                <X className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <Input
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="max-w-xs"
                />
                <Button type="button" variant="outline" disabled={!couponInput.trim() || applyingCoupon} onClick={applyCoupon}>
                  {applyingCoupon ? "Applying…" : "Apply"}
                </Button>
              </div>
              {couponError && <p className="mt-2 text-xs text-destructive">{couponError}</p>}
            </div>
          )}
        </Section>

        <Section step={5} title="Payment">
          <div className="flex items-center gap-3 rounded-md border border-border bg-muted/50 p-4">
            <CreditCard className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Pay securely with Cards, UPI, Netbanking, or Wallets via Razorpay — you&apos;ll
              complete payment in a secure window after clicking Place Order below.
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
          {discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount{appliedCoupon ? ` (${appliedCoupon.code})` : ""}</span>
              <span className="tabular-nums">−{formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="tabular-nums">
              {delivery ? (delivery.amount === 0 ? "Free" : formatPrice(delivery.amount)) : "—"}
            </span>
          </div>
          {taxAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {taxRate?.label ?? "Tax"} ({taxRate?.ratePercent}%)
              </span>
              <span className="tabular-nums">{formatPrice(taxAmount)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(total)}</span>
          </div>
        </div>

        <Button size="lg" className="mt-6 w-full" disabled={placing} onClick={placeOrder}>
          {placing
            ? pendingOrder
              ? "Opening Payment…"
              : "Placing Order…"
            : pendingOrder
              ? "Complete Payment"
              : "Place Order"}
        </Button>
        {pendingOrder && !placing && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Your order is saved — payment wasn&apos;t completed. Click above to try again.
          </p>
        )}
      </div>
    </div>
  );
}
