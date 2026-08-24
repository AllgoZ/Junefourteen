/**
 * Applies supabase/migrations/*.sql (in filename order) against
 * SUPABASE_DB_URL, tracking what's already run in a schema_migrations table
 * so re-running this script is a no-op for already-applied files.
 *
 * The Supabase CLI's own `db push` needs an interactive `supabase login`
 * (browser OAuth), which isn't available in this environment — a direct
 * Postgres connection via `pg` is the pragmatic non-interactive substitute.
 *
 * Usage: npx tsx supabase/scripts/run-migrations.ts
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { setDefaultResultOrder } from "node:dns";
import { Client } from "pg";

process.loadEnvFile(".env.local");

// Supabase's direct-connection host often resolves to an IPv6 address that
// this network can't route (ETIMEDOUT); prefer IPv4 when both are available.
setDefaultResultOrder("ipv4first");

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) throw new Error("SUPABASE_DB_URL is not set in .env.local");

  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  try {
    await client.query(`
      create table if not exists public.schema_migrations (
        filename text primary key,
        applied_at timestamptz not null default now()
      );
    `);

    const dir = join(process.cwd(), "supabase", "migrations");
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    const { rows: applied } = await client.query<{ filename: string }>(
      "select filename from public.schema_migrations"
    );
    const appliedSet = new Set(applied.map((r) => r.filename));

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`skip  ${file} (already applied)`);
        continue;
      }

      const sql = readFileSync(join(dir, file), "utf-8");
      console.log(`apply ${file}`);
      await client.query("begin");
      try {
        await client.query(sql);
        await client.query("insert into public.schema_migrations (filename) values ($1)", [file]);
        await client.query("commit");
      } catch (err) {
        await client.query("rollback");
        throw new Error(`Migration ${file} failed: ${(err as Error).message}`);
      }
    }

    console.log("All migrations applied.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
