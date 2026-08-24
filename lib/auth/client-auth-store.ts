"use client";

/**
 * Tiny module-level flag, mirroring the createLocalStore pattern in
 * lib/local-store.ts but for a single ephemeral boolean (not persisted) —
 * whether Cart/WishlistProvider should write authenticated mutations
 * through to Supabase. Set explicitly by the sign-in/out flows (see
 * components/account/auth-forms.tsx, sign-out-button.tsx) rather than
 * inferred reactively from Supabase's browser auth listener: that listener
 * only reflects sign-ins the *browser* client itself performed, and ours
 * happen server-side via Server Actions, so it wouldn't reliably fire here.
 */
let isAuthed = false;
const listeners = new Set<() => void>();

export function getIsAuthed(): boolean {
  return isAuthed;
}

export function setIsAuthed(value: boolean): void {
  if (isAuthed === value) return;
  isAuthed = value;
  listeners.forEach((listener) => listener());
}

export function subscribeIsAuthed(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
