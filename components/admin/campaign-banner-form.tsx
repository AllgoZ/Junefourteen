"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  saveHomepageCampaignAction,
  type HomepageCampaignFormState,
} from "@/app/admin/(protected)/collections/actions";
import type { AdminHomepageCampaignRow } from "@/lib/repositories/admin/homepage";

const INITIAL_STATE: HomepageCampaignFormState = {};

/**
 * Plain <img>, not next/image: the source can be a client-only blob: object
 * URL for a not-yet-uploaded file (same reasoning as BannerPreviewFrame).
 */
export function CampaignBannerForm({ campaign }: { campaign: AdminHomepageCampaignRow }) {
  const [state, action, pending] = useActionState(saveHomepageCampaignAction, INITIAL_STATE);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (state.success && !state.error) toast.success("Campaign banner saved.");
  }, [state.success, state.error]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative aspect-[21/9] w-full shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:w-72">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview ?? campaign.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="campaign-image">Replace Image</Label>
            <input
              id="campaign-image"
              name="image"
              type="file"
              accept="image/*"
              className="text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setPreview(file ? URL.createObjectURL(file) : null);
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="campaign-alt">Alt Text</Label>
            <Input id="campaign-alt" name="imageAlt" defaultValue={campaign.image_alt} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="campaign-link-label">Link Label</Label>
              <Input id="campaign-link-label" name="linkLabel" defaultValue={campaign.link_label} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="campaign-link-href">Link URL</Label>
              <Input id="campaign-link-href" name="linkHref" defaultValue={campaign.link_href} />
            </div>
          </div>
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} size="sm" className="self-start">
        {pending ? "Saving…" : "Save Campaign Banner"}
      </Button>
    </form>
  );
}
