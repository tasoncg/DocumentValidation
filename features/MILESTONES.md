# Document Violation Manager — MVP Feature List & Milestones

Source of truth: `../appspec.md`. Each feature folder contains a `spec.md`.

Sequencing follows the priority in appspec §18: login → template grid → upload .docx → convert to HTML → configure variables → save template → create case → replace occurrences → manual edit → preview → print.

## M1 — Foundation
Auth, DB, and app shell so every later feature has a place to live.

- [01-auth](m1-foundation/01-auth/spec.md) — email/password login, session, demo seed.
- [02-database-schema](m1-foundation/02-database-schema/spec.md) — Prisma schema for User, DocumentTemplate, DocumentVariable, ViolationCase, ViolationCaseValue.
- [03-app-shell](m1-foundation/03-app-shell/spec.md) — Next.js App Router layout, Tailwind + shadcn/ui, protected route wrapper.

## M2 — Template Management
Officers can land on a dashboard and bring a `.docx` into the system.

- [04-template-list](m2-template-management/04-template-list/spec.md) — `/templates` grid with search and actions.
- [05-template-upload-parse](m2-template-management/05-template-upload-parse/spec.md) — `.docx` upload + mammoth → HTML.
- [06-template-create-edit](m2-template-management/06-template-create-edit/spec.md) — `/templates/new` and `/templates/[id]/edit` shared layout with frozen top panel.
- [07-template-delete](m2-template-management/07-template-delete/spec.md) — soft/hard delete with confirmation.

## M3 — Variable Configuration
The core differentiator: turn selected text into reusable variables.

- [08-rich-text-editor](m3-variable-config/08-rich-text-editor/spec.md) — TipTap editor with paragraph markers.
- [09-variable-configuration](m3-variable-config/09-variable-configuration/spec.md) — selection → modal → wrap occurrences in `<span data-var-id>`.
- [10-variable-name-suggestions](m3-variable-config/10-variable-name-suggestions/spec.md) — heuristic suggestions (`ho_ten_nguoi_vi_pham`, `ngay_vi_pham`, …).
- [11-variable-highlight-navigation](m3-variable-config/11-variable-highlight-navigation/spec.md) — highlight all spans, Next/Previous like Ctrl+F.

## M4 — Violation Case Creation
Use a configured template to produce a real document.

- [12-case-create](m4-case-creation/12-case-create/spec.md) — `/templates/[id]/cases/new` page and persistence.
- [13-variable-replacement](m4-case-creation/13-variable-replacement/spec.md) — input value once, replace all linked spans live.
- [14-manual-edit-formatting](m4-case-creation/14-manual-edit-formatting/spec.md) — Bold/Italic/Underline/lists/alignment toolbar.

## M5 — Preview & Print
The acceptance-critical part: WYSIWYG print.

- [15-printable-document](m5-preview-print/15-printable-document/spec.md) — single shared `PrintableDocument` component.
- [16-preview-page](m5-preview-print/16-preview-page/spec.md) — A4 page boundary, clean rendering.
- [17-print-flow](m5-preview-print/17-print-flow/spec.md) — `@media print` CSS, `/cases/[id]/preview-print` route.
- [18-missing-variable-validation](m5-preview-print/18-missing-variable-validation/spec.md) — block/warn before preview if variables empty.

## M6 — Deploy
Make it shippable.

- [19-readme-deployment](m6-deploy/19-readme-deployment/spec.md) — README, env vars, Vercel deploy, print tips.

---

## Definition of MVP done
All acceptance criteria in appspec §16 pass end-to-end on local and on a Vercel deployment.
