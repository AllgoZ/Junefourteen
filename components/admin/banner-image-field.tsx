"use client";

import { useState } from "react";
import { UploadCloud, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BannerPreviewFrame } from "@/components/admin/banner-preview";
import { cn } from "@/lib/utils";

interface BannerImageFieldProps {
  kind: "desktop" | "mobile";
  label: string;
  recommended: string;
  fileFieldName: string;
  urlFieldName: string;
  altFieldName: string;
  altDefault: string;
  initialUrl?: string;
  previewSrc?: string;
  objectPosition: string;
  onFileSelected: (file: File) => void;
  onUrlChange: (url: string) => void;
  x: number;
  y: number;
  setX: (v: number) => void;
  setY: (v: number) => void;
  idPrefix: string;
  note?: string;
  extra?: React.ReactNode;
}

/**
 * One image slot (laptop or mobile) — upload dropzone with a "paste a URL
 * instead" toggle, alt text, crop-focus sliders, and a live preview, all in
 * one self-contained block. Used twice by BannerForm with entirely separate
 * field names/state per instance, so the two images can never bleed into
 * each other.
 */
export function BannerImageField({
  kind,
  label,
  recommended,
  fileFieldName,
  urlFieldName,
  altFieldName,
  altDefault,
  initialUrl,
  previewSrc,
  objectPosition,
  onFileSelected,
  onUrlChange,
  x,
  y,
  setX,
  setY,
  idPrefix,
  note,
  extra,
}: BannerImageFieldProps) {
  const startsAsUrlMode = Boolean(initialUrl) && !initialUrl!.includes("res.cloudinary.com");
  const [mode, setMode] = useState<"upload" | "url">(startsAsUrlMode ? "url" : "upload");
  const [urlValue, setUrlValue] = useState(startsAsUrlMode ? (initialUrl ?? "") : "");
  const [isDragging, setIsDragging] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFileSelected(file);
  }

  function toggleMode() {
    if (mode === "upload") {
      setMode("url");
    } else {
      setUrlValue("");
      onUrlChange("");
      setFileInputKey((k) => k + 1);
      setMode("upload");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">Recommended: {recommended}</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <BannerPreviewFrame kind={kind} src={previewSrc} objectPosition={objectPosition} />

        <div className="flex flex-1 flex-col gap-3">
          {mode === "upload" ? (
            <label
              htmlFor={`${idPrefix}-file`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFiles(e.dataTransfer.files);
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-6 text-center transition-colors",
                isDragging ? "border-foreground bg-muted" : "border-border hover:border-foreground/40"
              )}
            >
              <UploadCloud className="size-5 text-muted-foreground" aria-hidden="true" strokeWidth={1.5} />
              <span className="text-sm font-medium text-foreground">Click or drag to upload</span>
              <span className="text-xs text-muted-foreground">JPG, PNG, WebP</span>
              <input
                key={fileInputKey}
                id={`${idPrefix}-file`}
                name={fileFieldName}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          ) : (
            <Input
              name={urlFieldName}
              type="url"
              placeholder="https://…"
              value={urlValue}
              onChange={(e) => {
                setUrlValue(e.target.value);
                onUrlChange(e.target.value);
              }}
            />
          )}

          <button
            type="button"
            onClick={toggleMode}
            className="inline-flex items-center gap-1 self-start text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            <LinkIcon className="size-3" aria-hidden="true" />
            {mode === "upload" ? "or paste a URL instead" : "or upload a file instead"}
          </button>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-alt`}>Alt Text</Label>
            <Input id={`${idPrefix}-alt`} name={altFieldName} defaultValue={altDefault} />
          </div>

          {extra}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${idPrefix}-x`}>Horizontal Focus ({x}%)</Label>
              <input
                id={`${idPrefix}-x`}
                type="range"
                min={0}
                max={100}
                value={x}
                onChange={(e) => setX(Number(e.target.value))}
                className="w-full accent-foreground"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${idPrefix}-y`}>Vertical Focus ({y}%)</Label>
              <input
                id={`${idPrefix}-y`}
                type="range"
                min={0}
                max={100}
                value={y}
                onChange={(e) => setY(Number(e.target.value))}
                className="w-full accent-foreground"
              />
            </div>
          </div>

          {note && <p className="text-xs text-muted-foreground">{note}</p>}
        </div>
      </div>
    </div>
  );
}
