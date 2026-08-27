"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/ui/card";
import {
  saveAboutPageContentAction,
  type AboutPageFormState,
} from "@/app/admin/(protected)/about/actions";
import type { AdminAboutPageContentRow } from "@/lib/repositories/admin/about";

const INITIAL_STATE: AboutPageFormState = {};

const TEXTAREA_CLASS =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

/** Plain <img>, not next/image: the source can be a client-only blob: object URL for a not-yet-uploaded file (same reasoning as BannerPreviewFrame/CampaignBannerForm). */
function ImageField({
  name,
  label,
  currentUrl,
  altName,
  altDefault,
}: {
  name: string;
  label: string;
  currentUrl: string;
  altName: string;
  altDefault: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:w-56">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview ?? currentUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <Field label={label}>
          <input
            name={name}
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
          />
        </Field>
        <Field label="Alt Text">
          <Input name={altName} defaultValue={altDefault} />
        </Field>
      </div>
    </div>
  );
}

export function AboutPageForm({ content }: { content: AdminAboutPageContentRow }) {
  const [state, action, pending] = useActionState(saveAboutPageContentAction, INITIAL_STATE);

  useEffect(() => {
    if (state.success && !state.error) toast.success("About page saved.");
  }, [state.success, state.error]);

  return (
    <form action={action} className="flex flex-col gap-5">
      <AdminCard title="Hero Image">
        <ImageField
          name="heroImage"
          label="Replace Image"
          currentUrl={content.hero_image_url}
          altName="heroImageAlt"
          altDefault={content.hero_image_alt}
        />
      </AdminCard>

      <AdminCard title="Introduction" description="The heading and paragraph shown right below the hero image.">
        <div className="flex flex-col gap-4">
          <Field label="Heading">
            <Input name="heading" defaultValue={content.heading} />
          </Field>
          <Field label="Intro Paragraph">
            <textarea name="introBody" defaultValue={content.intro_body} rows={4} className={TEXTAREA_CLASS} />
          </Field>
        </div>
      </AdminCard>

      <AdminCard title="Our Story">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Eyebrow">
              <Input name="storyEyebrow" defaultValue={content.story_eyebrow} />
            </Field>
            <Field label="Title">
              <Input name="storyTitle" defaultValue={content.story_title} />
            </Field>
          </div>
          <Field label="Body">
            <textarea name="storyBody" defaultValue={content.story_body} rows={4} className={TEXTAREA_CLASS} />
          </Field>
          <ImageField
            name="storyImage"
            label="Replace Image"
            currentUrl={content.story_image_url}
            altName="storyImageAlt"
            altDefault={content.story_image_alt}
          />
        </div>
      </AdminCard>

      <AdminCard title="Our Philosophy">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Eyebrow">
              <Input name="philosophyEyebrow" defaultValue={content.philosophy_eyebrow} />
            </Field>
            <Field label="Title">
              <Input name="philosophyTitle" defaultValue={content.philosophy_title} />
            </Field>
          </div>
          <Field label="Body">
            <textarea name="philosophyBody" defaultValue={content.philosophy_body} rows={4} className={TEXTAREA_CLASS} />
          </Field>
          <ImageField
            name="philosophyImage"
            label="Replace Image"
            currentUrl={content.philosophy_image_url}
            altName="philosophyImageAlt"
            altDefault={content.philosophy_image_alt}
          />
        </div>
      </AdminCard>

      <AdminCard title="Journal" description="The closing blurb at the bottom of the page.">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Eyebrow">
              <Input name="journalEyebrow" defaultValue={content.journal_eyebrow} />
            </Field>
            <Field label="Title">
              <Input name="journalTitle" defaultValue={content.journal_title} />
            </Field>
          </div>
          <Field label="Body">
            <textarea name="journalBody" defaultValue={content.journal_body} rows={3} className={TEXTAREA_CLASS} />
          </Field>
        </div>
      </AdminCard>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} size="lg" className="shadow-[var(--shadow-elevated)]">
          {pending ? "Saving…" : "Save About Page"}
        </Button>
      </div>
    </form>
  );
}
