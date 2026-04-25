# 11 — Highlight & Next/Previous navigation

Refs: appspec §7, §10, §15.

## Goal
A Ctrl+F-like experience: clicking a variable highlights all its occurrences in the document and Next/Previous scrolls between them.

## Scope
- When a variable row is focused/clicked in the top panel (template config or case page), add a temporary CSS class to all spans with that `data-var-id` (e.g. `.var-highlight`).
- Next / Previous buttons:
  - Maintain a current-occurrence index per active variable.
  - Scroll the matching span into view (smooth, centered).
  - Add a stronger `.var-highlight-active` class to the current one.
- Clicking outside / changing variable clears highlights from the previous variable.
- Highlight classes are stripped before preview/print (handled in feature 15).

## Out of scope
- Cross-document search, case-insensitive matching for highlight.

## Acceptance criteria
- Selecting a variable with 5 occurrences highlights exactly 5 spans.
- Next cycles 1→2→…→5→1; Previous cycles in reverse.
- Active occurrence is visually distinguishable from the rest.
- Print output (feature 17) contains no `.var-highlight*` styling.
