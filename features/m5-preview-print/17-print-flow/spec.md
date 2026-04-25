# 17 — Print flow & print CSS

Refs: appspec §11 (print requirement, preview-print consistency).

## Goal
Pressing **In** produces a printed/PDF document that matches the preview as closely as the browser allows.

## Scope
- Dedicated route `/cases/[id]/preview-print` under the `(print)` layout (no chrome).
- Print CSS (`app/print.css` or component-scoped):
  - `@page { size: A4; margin: 20mm; }`.
  - `body { background: white; }` — no shadow/backdrop in print.
  - Hide everything outside `PrintableDocument` (`nav, header, aside, .toolbar, .top-panel { display: none !important; }`).
  - Strip highlight/marker styles under `@media print`.
  - `table, tr { break-inside: avoid; }`; `p { orphans: 2; widows: 2; }`.
  - Preserve font size, line height, paragraph spacing, table borders, bold/italic/underline.
- Print trigger:
  - The `(print)` route auto-calls `window.print()` after fonts settle (`document.fonts.ready`).
  - Fallback: visible **In** button if auto-print is blocked.
- After print, set `case.printedAt = now()` (best-effort; do not block the print).

## Out of scope
- Server-side PDF generation, custom paper sizes, duplex hints.

## Acceptance criteria
- Browser print preview shows only the document — no buttons, sidebars, highlights, or paragraph markers.
- Page size is A4 with the configured margins.
- A printed page (PDF or paper) visually matches the on-screen preview.
- README (feature 19) tells users to disable browser default header/footer.
