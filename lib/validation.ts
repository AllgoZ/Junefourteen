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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
}

export interface SignUpErrors {
  fullName?: string;
  email?: string;
  password?: string;
}

export function validateSignUp(input: SignUpInput): SignUpErrors {
  const errors: SignUpErrors = {};
  if (input.fullName.trim().length < 2) errors.fullName = "Enter your full name";
  if (!EMAIL_PATTERN.test(input.email)) errors.email = "Enter a valid email address";
  if (input.password.length < 8) errors.password = "Use at least 8 characters";
  return errors;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignInErrors {
  email?: string;
  password?: string;
}

export function validateSignIn(input: SignInInput): SignInErrors {
  const errors: SignInErrors = {};
  if (!EMAIL_PATTERN.test(input.email)) errors.email = "Enter a valid email address";
  if (!input.password) errors.password = "Enter your password";
  return errors;
}

export function hasAuthErrors(errors: SignUpErrors | SignInErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Quick mobile-number signup (add-to-bag/buy-now popup) — deliberately no
 * OTP/verification for v1, see components/account/mobile-signup-dialog.tsx.
 * Accepts a bare 10-digit Indian number or one already carrying a country
 * code; normalizePhone below turns either into the E.164 shape Supabase
 * phone auth expects.
 */
const BARE_10_DIGIT = /^\d{10}$/;
const E164_LOOSE = /^\+\d{11,15}$/;

export function validateMobile(mobile: string): string | undefined {
  const digitsOnly = mobile.replace(/[\s-]/g, "");
  if (!BARE_10_DIGIT.test(digitsOnly) && !E164_LOOSE.test(digitsOnly)) {
    return "Enter a valid mobile number";
  }
  return undefined;
}

/** Normalizes to E.164; bare 10-digit numbers are assumed India (+91), matching site.contactPhone. */
export function normalizePhone(mobile: string): string {
  const digitsOnly = mobile.replace(/[\s-]/g, "");
  return digitsOnly.startsWith("+") ? digitsOnly : `+91${digitsOnly}`;
}
