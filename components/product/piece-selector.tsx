"use client";

import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductPiece } from "@/types/product";

interface PieceSelectorProps {
  pieces: ProductPiece[];
  /** Currently-selected piece ids. */
  selected: Set<string>;
  onToggle: (pieceId: string) => void;
  error?: string;
}

/**
 * Multi-select chip group for a per-piece product (Top / Bottom / Dupatta).
 * Same chip visuals as SizeSelector/SleeveSelector; the only differences are
 * that several can be active at once and each chip shows its price. Keeping
 * the last selected chip from being unticked is handled by the caller.
 */
export function PieceSelector({ pieces, selected, onToggle, error }: PieceSelectorProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Pieces">
        {pieces.map((piece) => {
          const active = selected.has(piece.id);
          return (
            <button
              key={piece.id}
              type="button"
              role="checkbox"
              aria-checked={active}
              onClick={() => onToggle(piece.id)}
              className={cn(
                "flex h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm transition-colors",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:border-foreground/40"
              )}
            >
              <span>{piece.name}</span>
              <span className={cn("tabular-nums", active ? "text-background/70" : "text-muted-foreground")}>
                {formatPrice(piece.price)}
              </span>
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
