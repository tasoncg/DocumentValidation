# 13 — Live variable replacement

Refs: appspec §10, §15.

## Goal
Typing a value once updates **every** linked occurrence in the document immediately and consistently.

## Scope
- Controlled inputs in the top panel; on change:
  - Find every span with the matching `data-var-id` in the editor.
  - Replace its text content with the entered value (or revert to `originalText` if cleared).
  - Optionally store the original on `data-original-value` for potential reset.
- Debounce only as needed for editor performance; behavior must feel instant.
- Manual edits to a span’s text inside the editor are allowed and are not overwritten by the same input value (use a “dirty” marker, or accept that re-typing the input will overwrite — pick the simpler behavior and document it).
- Final HTML on save (feature 12) reflects the replaced values.

## Out of scope
- Formatting per-variable (bold/italic on a value), conditional templates, computed variables.

## Acceptance criteria
- Entering a value once updates all linked spans across the document.
- Clearing the input restores the original text.
- After save + reload, values persist and the editor shows the replaced text.
