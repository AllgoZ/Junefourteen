"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/ui/card";
import { INDIAN_STATES } from "@/lib/config/indian-states";
import { saveShippingZoneAction, type ShippingZoneFormState } from "@/app/admin/(protected)/shipping/actions";
import type { AdminShippingZoneRow } from "@/lib/repositories/admin/shipping";

const INITIAL_STATE: ShippingZoneFormState = {};

function ChipCheckbox({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center rounded-full border border-border px-3.5 py-1.5 text-sm text-foreground transition-colors has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background hover:border-foreground/40">
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} className="sr-only" />
      {label}
    </label>
  );
}

export function ShippingZoneForm({ zone }: { zone?: AdminShippingZoneRow }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveShippingZoneAction, INITIAL_STATE);

  useEffect(() => {
    if (state.zoneId && !zone) {
      router.push(`/admin/shipping/${state.zoneId}`);
    }
  }, [state.zoneId, zone, router]);

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-5">
      {zone && <input type="hidden" name="id" value={zone.id} />}

      <AdminCard title="Basics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="zone-name">Name</Label>
            <Input id="zone-name" name="name" defaultValue={zone?.name} placeholder="Metro Cities" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="zone-rate">Rate (₹)</Label>
            <Input id="zone-rate" name="rate" type="number" min="0" step="0.01" defaultValue={zone?.rate} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="zone-free-threshold">Free Shipping Above (₹)</Label>
            <Input
              id="zone-free-threshold"
              name="freeShippingThreshold"
              type="number"
              min="0"
              step="0.01"
              defaultValue={zone?.free_shipping_threshold ?? ""}
              placeholder="Leave blank for none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="zone-eta-min">Delivery — Min Days</Label>
            <Input id="zone-eta-min" name="etaMinDays" type="number" min="0" defaultValue={zone?.eta_min_days ?? 3} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="zone-eta-max">Delivery — Max Days</Label>
            <Input id="zone-eta-max" name="etaMaxDays" type="number" min="0" defaultValue={zone?.eta_max_days ?? 7} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="zone-sort">Sort Order</Label>
            <Input id="zone-sort" name="sortOrder" type="number" defaultValue={zone?.sort_order ?? 0} />
          </div>
        </div>
      </AdminCard>

      <AdminCard title="States" description="Which states this zone covers. A state not covered by any zone falls back to the default zone below.">
        <div className="flex flex-wrap gap-2">
          {INDIAN_STATES.map((s) => (
            <ChipCheckbox key={s} name="states" value={s} label={s} defaultChecked={Boolean(zone?.states.includes(s))} />
          ))}
        </div>
      </AdminCard>

      <AdminCard title="Publish">
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2.5 text-sm text-foreground">
            <input
              type="checkbox"
              name="isDefault"
              defaultChecked={zone?.is_default ?? false}
              className="size-4 rounded border-input accent-foreground"
            />
            Default zone — used for any state not covered above
          </label>
          <label className="flex items-center gap-2.5 text-sm text-foreground">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={zone?.is_active ?? true}
              className="size-4 rounded border-input accent-foreground"
            />
            Active
          </label>
        </div>
      </AdminCard>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} size="lg" className="shadow-[var(--shadow-elevated)]">
          {pending ? "Saving…" : "Save Zone"}
        </Button>
      </div>
    </form>
  );
}
