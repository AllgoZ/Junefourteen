"use client";

import { useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { adminSignIn, type AdminAuthFormState } from "@/lib/services/admin-auth";

const INITIAL_STATE: AdminAuthFormState = {};

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, action, pending] = useActionState(adminSignIn, INITIAL_STATE);

  useEffect(() => {
    if (state.success) {
      router.push("/admin");
      router.refresh();
    }
  }, [state.success, router]);

  const unauthorized = searchParams.get("error") === "unauthorized";

  return (
    <div className="w-full max-w-[380px]">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-11 items-center justify-center rounded-xl bg-foreground text-base font-semibold text-background">
          J
        </span>
        <h1 className="mt-4 text-xl font-medium tracking-tight text-foreground">JUNEFOURTEEN Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to manage the store.</p>
      </div>

      <div className="mt-7 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-elevated)]">
        {unauthorized && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" strokeWidth={1.75} />
            <p className="text-xs text-destructive">This account doesn&apos;t have admin access.</p>
          </div>
        )}

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="admin-email">Email</Label>
            <Input id="admin-email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="admin-password">Password</Label>
            <Input id="admin-password" name="password" type="password" required autoComplete="current-password" />
          </div>
          {state.error && <p className="text-xs text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending} className="mt-2">
            {pending ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">Authorized personnel only.</p>
    </div>
  );
}
