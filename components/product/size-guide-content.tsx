"use client";

import { useState } from "react";
import { cmToIn, sizeChartCm } from "@/lib/mock-data/size-chart";
import { cn } from "@/lib/utils";

const HOW_TO_MEASURE = [
  { label: "Bust", hint: "Wrap the tape around the fullest part of your bust, keeping it level and snug but not tight." },
  { label: "Waist", hint: "Measure around your natural waistline — the narrowest point above your navel." },
  { label: "Hip", hint: "Measure around the fullest part of your hips, roughly 20cm below your waist." },
  { label: "Shoulder", hint: "Measure straight across your back, from one shoulder tip to the other." },
];

export function SizeGuideContent() {
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const convert = (value: number) => (unit === "cm" ? value : cmToIn(value));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-1 self-start rounded-full border border-border p-0.5">
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

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
              <th className="py-2 pr-3 font-medium">Size</th>
              <th className="py-2 pr-3 font-medium">Bust</th>
              <th className="py-2 pr-3 font-medium">Waist</th>
              <th className="py-2 pr-3 font-medium">Hip</th>
              <th className="py-2 font-medium">Shoulder</th>
            </tr>
          </thead>
          <tbody>
            {sizeChartCm.map((row) => (
              <tr key={row.size} className="border-b border-border last:border-0">
                <td className="py-2.5 pr-3 font-medium text-foreground">{row.size}</td>
                <td className="py-2.5 pr-3 tabular-nums text-muted-foreground">{convert(row.bust)}</td>
                <td className="py-2.5 pr-3 tabular-nums text-muted-foreground">{convert(row.waist)}</td>
                <td className="py-2.5 pr-3 tabular-nums text-muted-foreground">{convert(row.hip)}</td>
                <td className="py-2.5 tabular-nums text-muted-foreground">{convert(row.shoulder)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">How to measure yourself</p>
        <ul className="flex flex-col gap-2">
          {HOW_TO_MEASURE.map((item) => (
            <li key={item.label} className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{item.label}: </span>
              {item.hint}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
