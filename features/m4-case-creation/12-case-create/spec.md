# 12 — Create violation case page

Refs: appspec §10.

## Goal
Officer turns a template into a real case at `/templates/[id]/cases/new`, fills variables, and saves.

## Scope
- Route `/templates/[id]/cases/new` (and `/cases/[id]` for revisit/edit).
- Top frozen panel:
  - Template name (read-only).
  - For each variable: name, **input value**, appearance count, Next/Previous (feature 11).
  - Buttons: **Preview**, **Save case**, **Print**.
- Document area (uses the same editor from feature 08) initialized from `template.contentHtml`.
- Save creates/updates a `ViolationCase` with `finalContentHtml` (current editor HTML) and a `ViolationCaseValue` per variable.
- On first save, also bump `template.lastUsedAt`.
- Loading & dirty-state guards mirror the template page.

## Out of scope
- Multi-officer collaboration, attachments, signatures.

## Acceptance criteria
- New case shows the template content with all variable spans intact.
- Values entered persist and reload on refresh.
- Saved cases count toward the template’s case-count column on `/templates`.
- `template.lastUsedAt` updates after the first save of a new case.
