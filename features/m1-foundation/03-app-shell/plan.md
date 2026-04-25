# Plan: 03 — App shell

## Dependencies
- 01 (server session for `(app)` guard) — develop in parallel; wire guard last.

## Files to add
- `app/layout.tsx` — root (html/body, Inter font, global CSS, Toaster)
- `app/globals.css` — Tailwind base + shadcn CSS vars
- `app/(app)/layout.tsx` — protected wrapper with header
- `app/(auth)/layout.tsx` — centered card layout
- `app/(print)/layout.tsx` — bare body, no chrome
- `components/header.tsx` — app name + user dropdown (Logout)
- `components/ui/*` — shadcn primitives (button, input, dialog, form, toast, table, dropdown-menu, alert-dialog)
- `lib/session.ts` — `getCurrentUser()` helper wrapping `getServerSession`
- `tailwind.config.ts`, `postcss.config.js`, `components.json`

## Implementation steps
1. Bootstrap with `npx create-next-app@latest` (TS, Tailwind, App Router, src/app off).
2. `npx shadcn@latest init`; add components listed above.
3. Configure Tailwind (`content`, theme tokens), import in `app/globals.css`.
4. `app/layout.tsx`: `<html><body><Toaster />{children}</body></html>`. Set `Inter` font via `next/font`.
5. `(app)/layout.tsx`: server component — `const user = await getCurrentUser(); if (!user) redirect('/login');` Render `<Header user={user} />` + `<main className="container mx-auto p-6">{children}</main>`.
6. `(auth)/layout.tsx`: centered flex container with shadcn `Card`.
7. `(print)/layout.tsx`: returns `<html><body className="bg-white">{children}</body></html>` — no header/sidebar; minimal CSS for print to work cleanly.
8. `Header`: logo/name on left, `DropdownMenu` on right with email + Logout (`signOut({ callbackUrl: '/login' })`).
9. Folder skeleton: `lib/`, `server/`, `components/`, `prisma/`.

## Verification
- `npm run dev` boots cleanly after `npm install` + `db:migrate` + `db:seed`.
- A page in `(app)/` shows the header; a page in `(print)/` does not.
- `tsc --noEmit` passes.
- `(print)` body has no sticky/absolute UI to interfere with future print CSS.
