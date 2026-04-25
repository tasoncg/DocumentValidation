# Plan: 12 — Create violation case page

## Dependencies
- 02 (Case + CaseValue), 03 (layout), 06 (shared editor pattern), 08 (editor), 13 (replacement), 11 (highlight)

## Files to add
- `app/(app)/templates/[id]/cases/new/page.tsx`
- `app/(app)/cases/[id]/page.tsx`
- `components/cases/case-editor-page.tsx`
- `components/cases/case-top-panel.tsx`
- `app/(app)/cases/actions.ts` — `createCase`, `updateCase`
- `server/cases.ts` — CRUD

## Implementation steps
1. `server/cases.ts`:
   - `createCase({ templateId, officerId, finalContentHtml, values })`:
     - `prisma.$transaction([create case + nested createMany values, update template lastUsedAt])`.
   - `updateCase(id, userId, { finalContentHtml, values, caseNumber })`:
     - Verify ownership (`officerId === userId`).
     - Upsert each `ViolationCaseValue` keyed by `[caseId, variableId]`.
   - `getCaseForEdit(id, userId)` — include template + variables + values.
2. `actions.ts`: server actions wrap server fns; `revalidatePath('/templates')`.
3. `/templates/[id]/cases/new/page.tsx` (RSC):
   - Fetch template + variables for owner; `notFound()` if missing.
   - Render `<CaseEditorPage mode="new" template={...} variables={...} />`.
4. `/cases/[id]/page.tsx` (RSC):
   - Fetch case + template + variables + existing values; render with `mode="edit"`.
5. `CaseEditorPage` (client):
   - State: `valueByVarId: Record<string, string>` (init from existing values or `''`), `dirty`.
   - `<CaseTopPanel template={...} variables={...} values={values} onChange={...} onPreview onPrint onSave />`.
   - `<RichEditor ref={editorRef} html={initialHtml} editable mode="case" />` (initial = existing `finalContentHtml` for edit, else `template.contentHtml`).
   - `onChange` from inputs delegates to feature 13's logic to update spans in editor.
   - Save: read `editorRef.current.getHTML()`, call action, on `mode="new"` → `router.replace('/cases/${id}')`.
6. `CaseTopPanel`:
   - Read-only template name.
   - For each variable: row with name, `<Input>` value, count, Next/Prev (feature 11), empty-badge (feature 18).
   - Buttons: Preview → flush + nav `/cases/${id}/preview`; Save → action; Print → flush + nav `/cases/${id}/preview-print`.
   - Block Preview/Print if missing variables (feature 18).
7. Dirty-state guard via `beforeunload`.

## Verification
- Open `/templates/[id]/cases/new` → editor shows template HTML with all `data-var-id` spans intact.
- Type a value → all spans updated (feature 13). Save → reload → values persist.
- `/templates` list shows incremented case count.
- After first save, template's `lastUsedAt` is now (move template to top of list).
