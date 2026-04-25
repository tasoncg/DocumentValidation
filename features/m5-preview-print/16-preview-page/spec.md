# 16 — Preview page (A4 on screen)

Refs: appspec §11 (preview requirement).

## Goal
A clean preview of the final document at `/cases/[id]/preview`, using the shared component.

## Scope
- Route `/cases/[id]/preview` (in the `(app)` group with chrome **outside** the page area).
- Renders `<PrintableDocument html={case.finalContentHtml} />` centered on a gray backdrop.
- Page boundary visuals:
  - A4 portrait, width matching A4 (`210mm`) at a sensible zoom.
  - Page margin matching print margin (default `20mm`, configurable via CSS var).
  - White page background, light shadow around it.
- Top toolbar (outside the page): Back, **In** (calls feature 17), source-of-truth label (template name + case number).
- Before rendering, force-flush editor content if user navigated from the case page (covered with feature 18 validation gate).

## Out of scope
- Live editing in preview, zoom controls, multi-page indicators.

## Acceptance criteria
- The preview page width matches A4 and respects the print margin.
- No editor toolbar/sidebar/markers visible.
- All variable values appear replaced; manual edits are reflected.
- Clicking **In** triggers the print flow (feature 17).
