"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HowToMeasureModal } from "@/components/product/how-to-measure-modal";
import {
  BOTTOM_MEASUREMENT_FIELDS,
  TOP_MEASUREMENT_FIELDS,
  type MeasurementField,
} from "@/lib/mock-data/measurement-fields";
import { cn } from "@/lib/utils";
import type { CustomMeasurements, MeasurementUnit } from "@/types/product";

interface CustomSizeFormProps {
  value: Partial<CustomMeasurements>;
  onChange: (next: Partial<CustomMeasurements>) => void;
  errors?: Record<string, string>;
}

function FieldGroup({
  title,
  fields,
  value,
  unit,
  errors,
  onFieldChange,
}: {
  title: string;
  fields: MeasurementField[];
  value: Partial<CustomMeasurements>;
  unit: MeasurementUnit;
  errors?: Record<string, string>;
  onFieldChange: (key: MeasurementField["key"], raw: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3">
        {fields.map((field) => {
          const error = errors?.[field.key];
          const inputId = `measurement-${field.key}`;
          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              <Label htmlFor={inputId} className="text-xs">
                {field.label}
                {field.required && <span className="text-destructive"> *</span>}
              </Label>
              <div className="relative">
                <Input
                  id={inputId}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.5}
                  aria-describedby={`${inputId}-hint`}
                  aria-invalid={Boolean(error)}
                  value={value[field.key] ?? ""}
                  onChange={(e) => onFieldChange(field.key, e.target.value)}
                  className="pr-9"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
                  {unit}
                </span>
              </div>
              {error ? (
                <p role="alert" className="text-[11px] text-destructive">
                  {error}
                </p>
              ) : (
                <p id={`${inputId}-hint`} className="text-[11px] text-muted-foreground">
                  {field.hint}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CustomSizeForm({ value, onChange, errors }: CustomSizeFormProps) {
  const unit = value.unit ?? "cm";

  const setUnit = (nextUnit: MeasurementUnit) => onChange({ ...value, unit: nextUnit });

  const setField = (key: MeasurementField["key"], raw: string) => {
    onChange({ ...value, [key]: raw === "" ? undefined : Number(raw) });
  };

  return (
    <div className="flex flex-col gap-6 rounded-xl bg-muted/60 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-full border border-border p-0.5">
          {(["cm", "in"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium uppercase",
                unit === u ? "bg-foreground text-background" : "text-muted-foreground"
              )}
            >
              {u}
            </button>
          ))}
        </div>
        <HowToMeasureModal />
      </div>

      <FieldGroup
        title="Top"
        fields={TOP_MEASUREMENT_FIELDS}
        value={value}
        unit={unit}
        errors={errors}
        onFieldChange={setField}
      />
      <FieldGroup
        title="Bottom"
        fields={BOTTOM_MEASUREMENT_FIELDS}
        value={value}
        unit={unit}
        errors={errors}
        onFieldChange={setField}
      />
    </div>
  );
}
