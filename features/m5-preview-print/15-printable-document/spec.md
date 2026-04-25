# 15 — `PrintableDocument` shared component

Refs: appspec §11 (preview-print consistency), §15.

## Goal
A single component used by both preview and print so the two can never diverge.

## Scope
- Component `components/PrintableDocument.tsx` accepting `{ html: string }`.
- Strips editor-only artifacts before render:
  - Removes `.var-highlight*` classes.
  - Removes paragraph-marker DOM/CSS.
  - Drops any `data-*` attributes that are editor-only (keep `data-var-id` only if needed for traceability — do not render markers).
- Sanitizes HTML through the same allowlist as feature 05 (defense in depth).
- Renders inside an A4 page wrapper (page size + margins set in CSS variables so feature 16 and feature 17 share them).
- No interactive controls inside the component.

## Out of scope
- Multi-page pagination logic (we let print do natural pagination).
- Watermarks, headers/footers per page.

## Acceptance criteria
- Given the same HTML, screen preview and printed output use the same DOM.
- No highlight classes, paragraph markers, or toolbar artifacts appear in the rendered output.
- Component is referentially used by both `/cases/[id]/preview` and the print route.
