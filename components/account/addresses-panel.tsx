"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addAddress, deleteAddress, type AddressFormState } from "@/lib/services/addresses";
import { INDIAN_STATES } from "@/lib/services/shipping";
import type { AddressRow } from "@/lib/repositories/addresses";

const INITIAL_STATE: AddressFormState = {};

export function AddressesPanel({ addresses }: { addresses: AddressRow[] }) {
  const [showForm, setShowForm] = useState(addresses.length === 0);

  return (
    <div className="flex flex-col gap-4 py-4 text-left">
      {addresses.length === 0 ? (
        <EmptyState
          title="No saved addresses"
          description="Save an address to check out faster next time."
          className="items-start px-0 py-0 text-left"
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {addresses.map((address) => (
            <li key={address.id} className="rounded-md border border-border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm text-foreground">
                  <p className="font-medium">
                    {address.full_name}
                    {address.is_default && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">Default</span>
                    )}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {address.address_line_1}
                    {address.address_line_2 ? `, ${address.address_line_2}` : ""}, {address.city},{" "}
                    {address.state} {address.postal_code}
                  </p>
                  <p className="text-muted-foreground">{address.phone}</p>
                </div>
                <form action={deleteAddress}>
                  <input type="hidden" name="id" value={address.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    Remove
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <AddressForm />
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowForm(true)}
          className="self-start"
        >
          Add Address
        </Button>
      )}
    </div>
  );
}

function AddressForm() {
  const [state, action, pending] = useActionState(addAddress, INITIAL_STATE);

  return (
    <form action={action} className="flex flex-col gap-3 rounded-md border border-border p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="address-name">Full Name</Label>
          <Input id="address-name" name="fullName" required />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="address-phone">Phone</Label>
          <Input id="address-phone" name="phone" type="tel" inputMode="tel" required />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="address-line1">Address Line 1</Label>
          <Input id="address-line1" name="addressLine1" required />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="address-line2">Address Line 2 (optional)</Label>
          <Input id="address-line2" name="addressLine2" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address-city">City</Label>
          <Input id="address-city" name="city" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address-state">State</Label>
          <Select name="state">
            <SelectTrigger id="address-state" className="w-full">
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
          <Label htmlFor="address-postal">PIN Code</Label>
          <Input id="address-postal" name="postalCode" inputMode="numeric" maxLength={6} required />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          name="isDefault"
          className="size-4 rounded border-input accent-foreground"
        />
        Set as default address
      </label>

      {state.error && <p className="text-xs text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} size="sm" className="self-start">
        {pending ? "Saving…" : "Save Address"}
      </Button>
    </form>
  );
}
