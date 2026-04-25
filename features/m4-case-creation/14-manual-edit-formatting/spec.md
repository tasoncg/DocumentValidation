# 14 — Manual edit & basic formatting toolbar

Refs: appspec §10 (formatting controls), §16.

## Goal
Officer can fine-tune the document by hand with a Teams-like minimal toolbar.

## Scope
- Toolbar buttons (above the editor, hidden in print): **Bold**, **Italic**, **Underline**, **Bullet list**, **Numbered list**, **Alignment** (left/center/right/justify).
- Keyboard shortcuts: Ctrl/Cmd+B/I/U.
- Toolbar reflects the current selection’s state.
- Manual edits do not break existing variable spans (TipTap atomic node behavior from feature 08).
- Editor content saved with the case is whatever the user sees, including manual edits.

## Out of scope
- Font family/size pickers, color, headings, tables editing UI (basic table render is enough), find/replace UI.

## Acceptance criteria
- Each toolbar button toggles the corresponding format on the current selection.
- Applying a list to a paragraph converts it without losing variable spans inside it.
- Manual edits persist after save and reflect in preview/print.
