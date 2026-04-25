// On Vercel/Postgres builds, run `prisma db push` to sync the schema.
// On local builds (sqlite), run `prisma migrate deploy` to apply migrations.
import { execSync } from "node:child_process";

const isPostgres =
  process.env.VERCEL === "1" ||
  process.env.VERCEL === "true" ||
  (process.env.DATABASE_URL ?? "").startsWith("postgres");

const cmd = isPostgres
  ? "npx prisma db push --skip-generate --accept-data-loss"
  : "npx prisma migrate deploy";

console.log(`[run-prod-db-sync] ${cmd}`);
try {
  execSync(cmd, { stdio: "inherit" });
} catch (err) {
  console.error("[run-prod-db-sync] failed", err);
  process.exit(1);
}
