# Plan: 06 — Template create & edit pages

## Dependencies
- 03 (layout), 05 (upload+parse), 08 (editor), 09 (variable list/modal)

## Files to add
- `app/(app)/templates/new/page.tsx`
- `app/(app)/templates/[id]/edit/page.tsx`
- `components/templates/template-editor-page.tsx` — shared client component
- `components/templates/top-panel.tsx` — sticky header with name, buttons, var list
- `app/(app)/templates/actions.ts` — server actions: `createTemplate`, `updateTemplate`
- `server/templates.ts` — extends with `getTemplateForEdit(id, userId)`, `createTemplate`, `updateTemplate`

## Implementation steps
1. `server/templates.ts`:
   - `createTemplate({ name, contentHtml, originalFileName, userId })` returns new template (`orderNumber` auto-set).
   - `updateTemplate(id, userId, { name, contentHtml })` — verify ownership.
   - `getTemplateForEdit(id, userId)` — include variables.
2. `actions.ts` (server actions): wrappers calling `getCurrentUser()` then the server fn; revalidate `/templates`.
3. `/templates/new/page.tsx` (RSC): renders `<TemplateEditorPage mode="new" />`.
4. `/templates/[id]/edit/page.tsx` (RSC): fetch template; if not found or wrong owner → `notFound()`. Pass to `TemplateEditorPage` with `mode="edit"`, `initialTemplate`.
5. `TemplateEditorPage` (client):
   - State: `name`, `html`, `originalFileName`, `variables`.
   - In `mode="new"`: if no html yet, show `<UploadButton onParsed={...} />` centered; on parse, set state and switch to editor view.
   - In `mode="edit"`: hydrate from `initialTemplate`.
   - Render `<TopPanel ... />` (sticky `top-0 z-10`) above `<RichEditor ref={editorRef} html={html} editable mode="template" />`.
   - Save handler: read editor HTML via `editorRef.current.getHTML()`, call action; on `mode="new"` → `router.replace('/templates/${id}/edit')`.
   - `useBeforeUnload` guard if `dirty`.
6. `TopPanel`:
   - Order number readout (or "—" before first save).
   - `<Input>` for name (required).
   - `<Button onClick={openVariableModal}>Cài đặt nội dung đã chọn</Button>` (disabled if no selection in editor).
   - `<Button onClick={save} disabled={saving || !name}>Lưu config</Button>`.
   - Slot for `<VariableList />` (feature 09).
7. Sticky CSS: `position: sticky; top: 0; background: white; border-bottom: 1px solid; z-index: 10;`.

## Verification
- After upload, HTML renders in editor.
- Renaming + Save persists; revisit `/templates/[id]/edit` shows new name.
- Page scrolls; top panel stays fixed.
- Edit page lists previously saved variables in top panel.
- Navigating away with unsaved edits triggers browser confirm.
