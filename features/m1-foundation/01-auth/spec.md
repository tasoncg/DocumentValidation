# 01 — Auth (login + session)

Refs: appspec §6.1, §5 (User entity).

## Goal
Officers can log in with email/password and access protected routes. A seeded demo account exists.

## Scope
- `/login` page with Email, Password, Login button.
- NextAuth Credentials provider (or equivalent simple JWT/session) — pick whichever ships fastest on Vercel.
- Password hashing with bcrypt.
- Session available server-side in App Router (RSC + route handlers).
- Logout action.
- Seed script creates demo user: `officer@example.com` / `Password123!` with role `officer`.
- Middleware/route guard redirects unauthenticated users to `/login`.

## Out of scope (MVP)
- Signup flow, email verification, password reset, OAuth, MFA.
- Per-tenant isolation beyond `createdById` ownership.

## Acceptance criteria
- I can log in with the seeded demo account and land on `/templates`.
- Unauthenticated requests to `/templates*` redirect to `/login`.
- Wrong password shows a clear error; no stack traces.
- Logout clears the session and returns to `/login`.

## Notes
- Keep `User.role` as enum `officer | admin`; only `officer` is exercised in MVP.
- No hardcoded secrets — `NEXTAUTH_SECRET` (or chosen lib equivalent) goes in `.env`.
