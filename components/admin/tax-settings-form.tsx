"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { saveTaxSettingsAction, type TaxSettingsFormState } from "@/app/admin/(protected)/settings/actions";
import type { AdminTaxSettingsRow } from "@/lib/repositories/admin/tax";

const INITIAL_STATE: TaxSettingsFormState = {};

export function TaxSettingsForm({ settings }: { settings: AdminTaxSettingsRow }) {
  const [state, action, pending] = useActionState(saveTaxSettingsAction, INITIAL_STATE);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tax-label">Label</Label>
          <Input id="tax-label" name="label" defaultValue={settings.label} placeholder="GST" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tax-rate">Rate (%)</Label>
          <Input id="tax-rate" name="ratePercent" type="number" min="0" max="100" step="0.01" defaultValue={settings.rate_percent} />
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-foreground">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={settings.is_active}
          className="size-4 rounded border-input accent-foreground"
        />
        Apply this tax at checkout
      </label>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && !state.error && <p className="text-sm text-muted-foreground">Saved.</p>}

      <Button type="submit" disabled={pending} size="sm" className="self-start">
        {pending ? "Saving…" : "Save Tax Settings"}
      </Button>
    </form>
  );
}
