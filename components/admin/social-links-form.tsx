"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { saveSocialLinksAction, type SocialLinksFormState } from "@/app/admin/(protected)/settings/actions";
import type { AdminSocialLinkRow } from "@/lib/repositories/admin/social-links";

const INITIAL_STATE: SocialLinksFormState = {};

interface Row {
  key: string;
  label: string;
  href: string;
}

function makeKey(): string {
  return Math.random().toString(36).slice(2);
}

export function SocialLinksForm({ links }: { links: AdminSocialLinkRow[] }) {
  const [state, action, pending] = useActionState(saveSocialLinksAction, INITIAL_STATE);
  const [rows, setRows] = useState<Row[]>(
    links.length > 0
      ? links.map((l) => ({ key: l.id, label: l.label, href: l.href }))
      : [{ key: makeKey(), label: "", href: "" }]
  );

  function updateRow(key: string, field: "label" | "href", value: string) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function addRow() {
    setRows((prev) => [...prev, { key: makeKey(), label: "", href: "" }]);
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.key} className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label>Label</Label>
              <Input
                name="label"
                value={row.label}
                onChange={(e) => updateRow(row.key, "label", e.target.value)}
                placeholder="Instagram"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label>URL</Label>
              <Input
                name="href"
                value={row.href}
                onChange={(e) => updateRow(row.key, "href", e.target.value)}
                placeholder="https://instagram.com/junefourteen"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeRow(row.key)}
              aria-label="Remove link"
              className="hover:text-destructive"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No links yet — add one below.</p>}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addRow} className="self-start">
        <Plus className="size-3.5" aria-hidden="true" />
        Add Link
      </Button>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && !state.error && <p className="text-sm text-muted-foreground">Saved.</p>}

      <Button type="submit" disabled={pending} size="sm" className="self-start">
        {pending ? "Saving…" : "Save Social Links"}
      </Button>
    </form>
  );
}
