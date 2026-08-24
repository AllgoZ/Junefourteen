/**
 * One-time bootstrap: promotes an existing (already signed-up) user to
 * role='admin'. Uses the admin-clients helper so it can bypass the
 * profiles_guard_role_change trigger (see supabase/migrations/0002_triggers.sql
 * — role changes are only ever allowed via the service-role client).
 *
 * Usage: npx tsx supabase/scripts/promote-admin.ts you@example.com
 */
import { createAdminClient } from "./shared/admin-clients";

process.loadEnvFile(".env.local");

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx supabase/scripts/promote-admin.ts <email>");
    process.exit(1);
  }

  const admin = createAdminClient();

  const { data: users, error: listError } = await admin.auth.admin.listUsers();
  if (listError) throw new Error(listError.message);

  const user = users.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.error(`No account found for ${email}. They need to sign up first at /account.`);
    process.exit(1);
  }

  const { error } = await admin.from("profiles").update({ role: "admin" }).eq("id", user.id);
  if (error) throw new Error(error.message);

  console.log(`${email} is now an admin. They can sign in at /admin/login.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
