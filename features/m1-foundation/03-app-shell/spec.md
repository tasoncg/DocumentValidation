# 03 — App shell (layout, theming, route guard)

Refs: appspec §4, §14.

## Goal
A consistent shell so every protected page gets the same chrome and styling, and unprotected pages (login, print) opt out.

## Scope
- Next.js App Router project bootstrapped with TypeScript, Tailwind, shadcn/ui.
- Root `app/layout.tsx` with font, theme, global CSS.
- `(app)/layout.tsx` group: header with app name + user menu (logout), main container.
- `(auth)/layout.tsx` group: minimal centered layout for `/login`.
- `(print)/layout.tsx` group: bare layout (no chrome) for the preview-print route.
- Server-side session check in `(app)/layout.tsx`; redirect to `/login` if missing.
- shadcn primitives wired: Button, Input, Dialog, Form, Toast, Table, DropdownMenu.
- Folder layout per appspec §14: `/app`, `/components`, `/lib`, `/server` (or `/services`), `/prisma`.

## Out of scope
- Dark mode toggle, i18n switcher, settings page.

## Acceptance criteria
- `npm run dev` boots without errors on a clean checkout after `npm install` + `prisma migrate dev` + `db seed`.
- A protected page rendered inside `(app)/` shows the header; the print route does not.
- Type-check (`tsc --noEmit`) passes.

## Notes
- Keep the print layout’s body free of any sticky/absolute UI so `@media print` work is trivial later.
