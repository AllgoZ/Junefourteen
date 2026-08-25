"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/ui/card";
import { saveCouponAction, type CouponFormState } from "@/app/admin/(protected)/coupons/actions";
import type { AdminCouponRow } from "@/lib/repositories/admin/coupons";

const INITIAL_STATE: CouponFormState = {};

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function CouponForm({ coupon }: { coupon?: AdminCouponRow }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveCouponAction, INITIAL_STATE);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    (coupon?.discount_type as "percentage" | "fixed") ?? "percentage"
  );

  useEffect(() => {
    if (state.couponId && !coupon) {
      router.push(`/admin/coupons/${state.couponId}`);
    }
  }, [state.couponId, coupon, router]);

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-5">
      {coupon && <input type="hidden" name="id" value={coupon.id} />}

      <AdminCard title="Basics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coupon-code">Code</Label>
            <Input
              id="coupon-code"
              name="code"
              defaultValue={coupon?.code}
              placeholder="WELCOME10"
              className="uppercase"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coupon-description">Description</Label>
            <Input id="coupon-description" name="description" defaultValue={coupon?.description ?? ""} placeholder="10% off first order" />
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Discount">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coupon-type">Type</Label>
            <select
              id="coupon-type"
              name="discountType"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coupon-value">{discountType === "percentage" ? "Percent Off" : "Amount Off (₹)"}</Label>
            <Input
              id="coupon-value"
              name="discountValue"
              type="number"
              min="0"
              max={discountType === "percentage" ? 100 : undefined}
              step="0.01"
              defaultValue={coupon?.discount_value}
              required
            />
          </div>
          {discountType === "percentage" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="coupon-max-discount">Max Discount (₹)</Label>
              <Input
                id="coupon-max-discount"
                name="maxDiscountAmount"
                type="number"
                min="0"
                step="0.01"
                defaultValue={coupon?.max_discount_amount ?? ""}
                placeholder="Leave blank for no cap"
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coupon-min-order">Minimum Order (₹)</Label>
            <Input
              id="coupon-min-order"
              name="minOrderAmount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={coupon?.min_order_amount ?? 0}
            />
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Limits">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coupon-starts">Starts</Label>
            <Input id="coupon-starts" name="startsAt" type="date" defaultValue={toDateInputValue(coupon?.starts_at ?? null)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coupon-expires">Expires</Label>
            <Input id="coupon-expires" name="expiresAt" type="date" defaultValue={toDateInputValue(coupon?.expires_at ?? null)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coupon-usage-limit">Usage Limit</Label>
            <Input
              id="coupon-usage-limit"
              name="usageLimit"
              type="number"
              min="1"
              defaultValue={coupon?.usage_limit ?? ""}
              placeholder="Leave blank for unlimited"
            />
          </div>
          {coupon && (
            <div className="flex flex-col gap-1.5">
              <Label>Used</Label>
              <p className="flex h-8 items-center text-sm text-muted-foreground">{coupon.times_used} time{coupon.times_used === 1 ? "" : "s"}</p>
            </div>
          )}
        </div>
      </AdminCard>

      <AdminCard title="Publish">
        <label className="flex items-center gap-2.5 text-sm text-foreground">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={coupon?.is_active ?? true}
            className="size-4 rounded border-input accent-foreground"
          />
          Active
        </label>
      </AdminCard>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} size="lg" className="shadow-[var(--shadow-elevated)]">
          {pending ? "Saving…" : "Save Coupon"}
        </Button>
      </div>
    </form>
  );
}
