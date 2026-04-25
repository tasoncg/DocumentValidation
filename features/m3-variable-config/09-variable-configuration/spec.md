# 09 — Variable configuration (selection → variable)

Refs: appspec §7, §15.

## Goal
Officer selects text in the editor and turns it into a reusable variable; all chosen occurrences get wrapped with stable spans.

## Scope
- Trigger: button **“Cài đặt nội dung đã chọn”** in the top frozen panel.
- Modal fields:
  - **Variable name** (with suggestion from feature 10).
  - **Original selected text** (read-only).
  - **Data type** hidden, defaults to `nvarchar`.
  - **Appearance count** (live).
  - **Next / Previous** buttons (delegated to feature 11) and a per-occurrence include/exclude toggle list.
  - Apply mode: **All appearances**, **Only this occurrence**, or **Manual selection**.
- Detection: case-sensitive exact match across the document’s text content; ignore matches that fall inside an existing `VariableSpan` (no nesting).
- On save:
  - Wrap each included occurrence with `<span data-var-id="…" data-placeholder-key="…">Original Text</span>`.
  - Persist `DocumentVariable` row: name, originalText, placeholderKey, appearanceCount, dataType.
  - During template configuration, the span still **displays the original text** (appspec §7).
- Edit existing variable: rename, change inclusion set, or delete (removes spans, unwraps text).
- Validation: name must be unique per template, snake_case, non-empty.

## Out of scope
- Regex matching, fuzzy matching, multi-text variables, variables that span across block elements.

## Acceptance criteria
- Selecting `Nguyễn Văn A`, choosing All, saving — every exact occurrence gets a span tied to one DB variable.
- Appearance count in the panel matches the number of spans in the editor HTML.
- Reopening the modal for an existing variable preserves its inclusion set.
- Deleting a variable unwraps its spans and removes the DB row.
