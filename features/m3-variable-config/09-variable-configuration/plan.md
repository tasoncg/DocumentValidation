# Plan: 09 — Variable configuration

## Dependencies
- 02 (DocumentVariable), 06 (template page hosts modal), 08 (editor + VariableSpan), 10 (suggested name), 11 (highlight wired here)

## Files to add
- `components/templates/variable-modal.tsx`
- `components/templates/variable-list.tsx`
- `lib/find-occurrences.ts` — pure function on TipTap doc
- `lib/placeholder-key.ts` — `nanoid(10)` style stable key
- `app/(app)/templates/variables/actions.ts` — server actions
- `server/variables.ts` — CRUD

## Implementation steps
1. `lib/placeholder-key.ts`: `import { nanoid } from 'nanoid'; export const newPlaceholderKey = () => 'pk_' + nanoid(10);`.
2. `lib/find-occurrences.ts`:
   - Input: TipTap `editor` + `selectedText`.
   - Walk `editor.state.doc.descendants` collecting text-node ranges where `node.text` matches (case-sensitive `indexOf` loop).
   - Reject ranges already covered by a `variableSpan` mark (`node.marks.some(m => m.type.name === 'variableSpan')`).
   - Return `Array<{ from, to, text, contextSnippet }>` (snippet = ±20 chars for the per-occurrence list).
3. `VariableModal` (Dialog):
   - Open trigger from TopPanel (feature 06).
   - Form fields:
     - `name` — pre-filled by feature 10's `suggestVariableName`.
     - `originalText` — readonly (the user's selection).
     - `applyMode` — Radio: `all` (default) | `only` | `manual`.
     - `occurrencesList` — list of context snippets with checkboxes (only enabled when `applyMode === 'manual'`).
     - `appearanceCount` — live derived from selected items.
     - Next/Prev buttons → call `editor.scrollToVarOccurrence` (feature 11) on the candidate ranges.
   - Submit:
     - Compute included ranges based on mode.
     - Generate `placeholderKey`.
     - Editor command: for each range (descending) `chain().setTextSelection({from, to}).setMark('variableSpan', { varId, placeholderKey, originalValue: text }).run()`.
     - Call `createVariableAction({ templateId, name, originalText, placeholderKey, appearanceCount })`.
     - Persist updated `contentHtml` via existing template save action (or trigger save here; pick one — recommend: defer save to "Lưu config" button so this stays optimistic).
   - Validation: `name` snake_case (`/^[a-z][a-z0-9_]*$/`), unique within template variables.
4. `VariableList` (in TopPanel):
   - Each row: name, count, click → highlight via `editor.highlightVar(varId)`, Edit → reopen modal preloaded, Delete → confirm + remove mark + delete row.
   - Edit logic: load existing inclusion (all spans matching `varId`) as the manual occurrence checkbox state.
   - Delete logic: `editor.commands.unsetMark('variableSpan')` scoped to ranges with that `varId`; then `deleteVariableAction(id)`.
5. `server/variables.ts`:
   - `createVariable({ templateId, ...data, userId })` — verify template ownership.
   - `updateVariable(id, userId, data)`.
   - `deleteVariable(id, userId)`.

## Verification
- Selecting `Nguyễn Văn A`, applyMode=all, save → every exact occurrence has a `variableSpan` mark with same `data-var-id`.
- Appearance count in panel === number of `data-var-id` attributes in `getHTML()`.
- Reopen modal for existing variable → inclusion checkboxes match wrapped occurrences.
- Delete variable → marks removed, DB row gone, list updates.
- Validation: invalid name shows inline error; duplicate name blocked before submit.

## Notes
- Detection is **case-sensitive exact match** by spec — keep it that way; do not lowercase.
- Skip matches inside existing variableSpan to prevent nesting.
