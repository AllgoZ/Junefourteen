"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  updateAdminEmail,
  updateAdminPassword,
  type UpdateCredentialsState,
} from "@/lib/services/admin-auth";

const INITIAL_STATE: UpdateCredentialsState = {};

function StatusMessage({ state }: { state: UpdateCredentialsState }) {
  if (state.error) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-2.5">
        <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" aria-hidden="true" />
        <p className="text-xs text-destructive">{state.error}</p>
      </div>
    );
  }
  if (state.message) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/60 p-2.5">
        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-foreground" aria-hidden="true" />
        <p className="text-xs text-foreground">{state.message}</p>
      </div>
    );
  }
  return null;
}

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, action, pending] = useActionState(updateAdminEmail, INITIAL_STATE);

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-email">New Email</Label>
        <Input id="new-email" name="newEmail" type="email" required autoComplete="email" placeholder={currentEmail} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email-current-password">Current Password</Label>
        <Input
          id="email-current-password"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      <StatusMessage state={state} />
      <Button type="submit" disabled={pending} size="sm" className="self-start">
        {pending ? "Updating…" : "Update Email"}
      </Button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(updateAdminPassword, INITIAL_STATE);

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pw-current-password">Current Password</Label>
        <Input
          id="pw-current-password"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-password">New Password</Label>
        <Input id="new-password" name="newPassword" type="password" required autoComplete="new-password" />
      </div>
      <StatusMessage state={state} />
      <Button type="submit" disabled={pending} size="sm" className="self-start">
        {pending ? "Updating…" : "Update Password"}
      </Button>
    </form>
  );
}
