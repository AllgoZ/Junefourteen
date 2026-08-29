"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { saveLegalPageAction, type LegalPageFormState } from "@/app/admin/(protected)/legal/actions";
import type { AdminLegalPageRow, LegalPageSlug } from "@/lib/repositories/admin/legal";

const INITIAL_STATE: LegalPageFormState = {};

const TEXTAREA_CLASS =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 font-mono text-xs leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function LegalPageForm({ page, slug }: { page: AdminLegalPageRow; slug: LegalPageSlug }) {
  const [state, action, pending] = useActionState(saveLegalPageAction, INITIAL_STATE);

  useEffect(() => {
    if (state.success && !state.error) toast.success("Page saved.");
  }, [state.success, state.error]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="slug" value={slug} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${slug}-title`}>Title</Label>
          <Input id={`${slug}-title`} name="title" defaultValue={page.title} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${slug}-subtitle`}>Subtitle</Label>
          <Input id={`${slug}-subtitle`} name="subtitle" defaultValue={page.subtitle} placeholder="Last updated …" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${slug}-body`}>Body</Label>
        <p className="text-xs text-muted-foreground">
          Start a line with <code className="rounded bg-muted px-1 py-0.5">## </code> to begin a new section
          heading. Leave a blank line between paragraphs and sections.
        </p>
        <textarea id={`${slug}-body`} name="body" defaultValue={page.body} rows={16} className={TEXTAREA_CLASS} />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && !state.error && <p className="text-sm text-muted-foreground">Saved.</p>}

      <Button type="submit" disabled={pending} size="sm" className="self-start">
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
