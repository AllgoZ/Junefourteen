"use client";

import { useState } from "react";
import { ChevronRight, Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { estimateShippingAction } from "@/app/(site)/checkout/actions";
import { INDIAN_STATES } from "@/lib/config/indian-states";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ShippingEstimateResult } from "@/types/shipping";

const PIN_PATTERN = /^\d{6}$/;

export function ShippingEstimator({ subtotal }: { subtotal: number }) {
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState("");
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [result, setResult] = useState<ShippingEstimateResult | null>(null);

  const handleEstimate = async () => {
    if (!state) {
      setStatus("error");
      setResult(null);
      return;
    }
    if (!PIN_PATTERN.test(pin)) {
      setStatus("error");
      setResult(null);
      return;
    }
    setStatus("loading");
    const estimate = await estimateShippingAction({ country: "India", state, pin, orderSubtotal: subtotal });
    setResult(estimate);
    setStatus("idle");
  };

  return (
    <div className="border-t border-border pt-4">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Truck className="size-4" aria-hidden="true" />
          Estimate shipping
        </span>
        {!expanded && result ? (
          <span className="text-xs text-muted-foreground">
            {result.zoneLabel}: {formatPrice(result.amount)}
          </span>
        ) : (
          <ChevronRight
            className={cn("size-4 text-muted-foreground transition-transform", expanded && "rotate-90")}
            aria-hidden="true"
          />
        )}
      </button>

      {expanded && (
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="shipping-country">Country</Label>
              <Input id="shipping-country" value="India" disabled />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="shipping-state">State</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger id="shipping-state" className="w-full">
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="shipping-pin">PIN code</Label>
              <Input
                id="shipping-pin"
                inputMode="numeric"
                maxLength={6}
                placeholder="641045"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>

          {status === "error" && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              Enter your state and a valid 6-digit PIN code.
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full"
            onClick={handleEstimate}
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Estimating…
              </>
            ) : (
              "Estimate"
            )}
          </Button>

          {result && (
            <p className="mt-3 text-sm text-foreground" role="status">
              Delivery to <span className="font-medium">{result.zoneLabel}</span>:{" "}
              <span className="font-medium">{formatPrice(result.amount)}</span>, {result.etaLabel}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
