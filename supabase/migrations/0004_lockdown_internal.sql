-- schema_migrations is internal migration-runner bookkeeping, not app data.
-- It has no RLS policies, so enabling RLS with none defined makes it
-- deny-all for anon/authenticated via PostgREST (only the service-role
-- client or a direct Postgres connection can touch it) — otherwise it would
-- sit publicly readable/writable by default, same as any other public table.
alter table public.schema_migrations enable row level security;
