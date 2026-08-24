import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center p-6">
      <Suspense>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
