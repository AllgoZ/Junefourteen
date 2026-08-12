import { ALL_MEASUREMENT_FIELDS } from "@/lib/mock-data/measurement-fields";
import type { CustomMeasurements } from "@/types/product";

const MIN_CM = 10;
const MAX_CM = 200;

export function validateCustomMeasurements(
  measurements: Partial<CustomMeasurements>
): Record<string, string> {
  const errors: Record<string, string> = {};
  const unit = measurements.unit ?? "cm";

  for (const field of ALL_MEASUREMENT_FIELDS) {
    const raw = measurements[field.key];

    if (raw == null || raw === ("" as unknown)) {
      if (field.required) errors[field.key] = "Required";
      continue;
    }

    const value = Number(raw);
    if (Number.isNaN(value)) {
      errors[field.key] = "Enter a number";
      continue;
    }

    const cmValue = unit === "in" ? value * 2.54 : value;
    if (cmValue < MIN_CM || cmValue > MAX_CM) {
      errors[field.key] = "Check this measurement";
    }
  }

  return errors;
}

interface SelectionInput {
  requiresSize: boolean;
  requiresSleeve: boolean;
  sizeMode: "standard" | "custom";
  size?: string;
  sleeve?: string;
  customMeasurements?: Partial<CustomMeasurements>;
}

export interface SelectionErrors {
  size?: string;
  sleeve?: string;
  measurements?: Record<string, string>;
}

export function validateAddToBagSelection(input: SelectionInput): SelectionErrors {
  const errors: SelectionErrors = {};

  if (input.requiresSize && input.sizeMode === "standard" && !input.size) {
    errors.size = "Select a size";
  }
  if (input.requiresSleeve && !input.sleeve) {
    errors.sleeve = "Select a sleeve length";
  }
  if (input.sizeMode === "custom") {
    const measurementErrors = validateCustomMeasurements(input.customMeasurements ?? {});
    if (Object.keys(measurementErrors).length > 0) {
      errors.measurements = measurementErrors;
    }
  }

  return errors;
}

export function hasSelectionErrors(errors: SelectionErrors): boolean {
  return Boolean(errors.size || errors.sleeve || errors.measurements);
}
