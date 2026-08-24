import { SignOutButton } from "@/components/account/sign-out-button";

export function ProfilePanel({ email, fullName }: { email: string; fullName: string | null }) {
  return (
    <div className="flex flex-col items-start gap-3 py-4 text-left">
      <div className="text-sm">
        {fullName && <p className="font-medium text-foreground">{fullName}</p>}
        <p className="text-muted-foreground">{email}</p>
      </div>
      <SignOutButton />
    </div>
  );
}
