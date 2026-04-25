# 18 — Missing-variable validation

Refs: appspec §11 (preview requirement — warn if a variable has no value).

## Goal
Avoid printing a document that still contains template placeholders or untouched original values.

## Scope
- Before opening Preview or Print:
  - Compute the set of variables with empty `ViolationCaseValue.value`.
  - If non-empty, block the action with a modal listing the missing variable names; offer **Cancel** and **Continue anyway**.
  - In the top panel, show a red dot / warning badge next to any variable whose input is empty.
- On the preview page itself, if a variable is still empty (because user chose Continue), highlight those spans subtly **on screen only** (never in print).
- Force-save editor state before navigating to preview/print so manual edits aren’t lost.

## Out of scope
- Type-specific validation (dates, numbers) — `dataType` is `nvarchar` for MVP.
- Detecting untouched original text that the user *intended* to keep (no false positives).

## Acceptance criteria
- Trying to preview with an empty variable shows the warning modal listing exact variable names.
- The badge in the top panel disappears once a value is entered.
- Print never includes the on-screen empty-variable highlight.
