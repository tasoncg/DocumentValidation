# 08 — Rich text editor (TipTap)

Refs: appspec §4, §6.3, §10.

## Goal
A reusable editor used by template config and case creation: renders our HTML, tracks selection, exposes commands the variable-configuration feature will call.

## Scope
- TipTap editor configured with extensions: StarterKit (paragraph, bold, italic, bulletList, orderedList, history), Underline, TextAlign, Table + TableRow/TableCell/TableHeader, Link (read-only render is enough for MVP).
- Custom node/mark **VariableSpan** that renders as `<span data-var-id data-placeholder-key>`; not editable inside (atomic) on the case page; editable wrapper on the template page so the original text remains visible while configuring.
- Editor exposes:
  - `getHTML()` — sanitized HTML out.
  - `setHTML(html)` — initial load (after upload or from DB).
  - `getSelectionText()` — used by feature 09.
  - imperative API to scroll to a specific span by `data-var-id` + occurrence index (used by feature 11).
- Paragraph marker on screen: a small left-gutter index next to each top-level block; pure CSS counter, hidden in print.

## Out of scope
- Image/media uploads, comments, collaborative editing, find-and-replace UI.

## Acceptance criteria
- HTML coming from mammoth (feature 05) renders without console errors.
- Selecting text returns the exact substring through `getSelectionText()`.
- The editor’s output HTML re-renders identically when reloaded (round-trip stable).
- Paragraph markers are visible on screen, absent under `@media print`.

## Notes
- Keep the editor a pure component; route pages own data fetching/persistence.
