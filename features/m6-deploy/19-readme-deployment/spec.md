# 19 — README & Vercel deployment

Refs: appspec §13 (project output), §16 (deploy criterion).

## Goal
A new dev (or the user) can clone, run locally, and deploy to Vercel by following the README.

## Scope
- `README.md` covering:
  - Prerequisites (Node version, package manager).
  - Install & run local: `npm install`, `npx prisma migrate dev`, `npx prisma db seed`, `npm run dev`.
  - Demo credentials.
  - Environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET` (or chosen auth lib equivalent), any storage URLs.
  - Switching DB: SQLite (`file:./dev.db`) vs Postgres/Supabase URL.
  - Deploy to Vercel: link repo, set env vars, set build command, run migrations on deploy.
  - Printing tips: disable browser default header/footer, set margins to default, A4 paper, print background graphics on if needed.
- `.env.example` with every required variable (no real secrets).
- `package.json` scripts: `dev`, `build`, `start`, `db:migrate`, `db:seed`, `lint`, `typecheck`.
- Vercel config notes: Node runtime, Prisma generate in build, Postgres connection pooling note.

## Out of scope
- CI pipelines, preview deployment automation beyond Vercel defaults.

## Acceptance criteria
- Following the README on a clean machine boots the app locally and logs in with the demo user.
- Following the deploy section produces a working Vercel deployment using a Postgres URL.
- Print produces a clean output when the user follows the printing tips section.
