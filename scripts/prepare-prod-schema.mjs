// Swap schema.prisma → postgres variant when running on Vercel.
// Local dev keeps SQLite; Vercel builds use Postgres via DATABASE_URL.
import fs from "node:fs";
import path from "node:path";

const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";
const isPostgresUrl = (process.env.DATABASE_URL ?? "").startsWith("postgres");

if (!isVercel && !isPostgresUrl) {
  console.log("[prepare-prod-schema] Local/SQLite build — leaving schema.prisma untouched.");
  process.exit(0);
}

const root = path.resolve(process.cwd(), "prisma");
const src = path.join(root, "schema.postgres.prisma");
const dest = path.join(root, "schema.prisma");

if (!fs.existsSync(src)) {
  console.error("[prepare-prod-schema] Missing prisma/schema.postgres.prisma");
  process.exit(1);
}

fs.copyFileSync(src, dest);
console.log("[prepare-prod-schema] Copied postgres schema → schema.prisma");

// Drop sqlite migrations on prod build — they're not Postgres-compatible.
// We use `prisma db push` on the first prod deploy instead of `migrate deploy`.
const migrationsDir = path.join(root, "migrations");
if (fs.existsSync(migrationsDir)) {
  fs.rmSync(migrationsDir, { recursive: true, force: true });
  console.log("[prepare-prod-schema] Removed sqlite migrations directory");
}
