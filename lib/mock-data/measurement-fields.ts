import type { CustomMeasurements } from "@/types/product";

export type MeasurementKey = keyof Omit<CustomMeasurements, "unit">;

export interface MeasurementField {
  key: MeasurementKey;
  label: string;
  hint: string;
  required?: boolean;
}

export const TOP_MEASUREMENT_FIELDS: MeasurementField[] = [
  { key: "bust", label: "Bust", hint: "Around the fullest part of your bust.", required: true },
  { key: "upperChest", label: "Upper Chest", hint: "Straight across, just below the collarbone." },
  { key: "middleChest", label: "Middle Chest", hint: "Straight across, midway between upper chest and bust." },
  { key: "shoulder", label: "Shoulder", hint: "Shoulder tip to shoulder tip, across the back.", required: true },
  { key: "sleeveLength", label: "Sleeve Length", hint: "Shoulder tip to where you'd like the sleeve to end.", required: true },
  { key: "frontNeck", label: "Front Neck", hint: "Depth of the neckline at the front." },
  { key: "backNeck", label: "Back Neck", hint: "Depth of the neckline at the back." },
  { key: "topLength", label: "Top Length", hint: "Shoulder to your desired hemline.", required: true },
  { key: "armRound", label: "Arm Round", hint: "Around the fullest part of your upper arm." },
];

export const BOTTOM_MEASUREMENT_FIELDS: MeasurementField[] = [
  { key: "waist", label: "Waist", hint: "Around your natural waistline.", required: true },
  { key: "hip", label: "Hip", hint: "Around the fullest part of your hips.", required: true },
  { key: "pantLength", label: "Pant Length", hint: "Waist to your desired hemline.", required: true },
];

export const ALL_MEASUREMENT_FIELDS = [...TOP_MEASUREMENT_FIELDS, ...BOTTOM_MEASUREMENT_FIELDS];
