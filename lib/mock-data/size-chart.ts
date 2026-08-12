import type { Size } from "@/types/product";

export interface SizeChartRow {
  size: Size;
  bust: number;
  waist: number;
  hip: number;
  shoulder: number;
}

/** All measurements in centimetres; convert on display for the CM/IN toggle. */
export const sizeChartCm: SizeChartRow[] = [
  { size: "XS", bust: 83, waist: 66, hip: 89, shoulder: 35.5 },
  { size: "S", bust: 88, waist: 71, hip: 94, shoulder: 36.5 },
  { size: "M", bust: 93, waist: 76, hip: 99, shoulder: 37.5 },
  { size: "L", bust: 98, waist: 81, hip: 104, shoulder: 38.5 },
  { size: "XL", bust: 105, waist: 88, hip: 111, shoulder: 40 },
  { size: "XXL", bust: 112, waist: 95, hip: 118, shoulder: 41.5 },
];

export const CM_TO_IN = 0.393701;

export function cmToIn(valueCm: number): number {
  return Math.round(valueCm * CM_TO_IN * 10) / 10;
}
