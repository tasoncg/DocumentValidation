# Plan: 14 — Manual edit & basic formatting toolbar

## Dependencies
- 08 (editor)

## Files to add
- `components/editor/toolbar.tsx`
- Update `components/editor/rich-editor.tsx` — accept `toolbar` slot above editor

## Implementation steps
1. `Toolbar` (client):
   - Receives `editor` (TipTap instance) via prop.
   - Buttons: Bold, Italic, Underline, BulletList, OrderedList, AlignLeft/Center/Right/Justify.
   - Each calls `editor.chain().focus().toggleX().run()` (or `setTextAlign('center')`).
   - Active state: `editor.isActive('bold')` etc. → button variant `default` vs `ghost`.
   - Use `useEditorState` or rerender on `editor.on('selectionUpdate'|'transaction')` so active state stays accurate.
2. Keyboard shortcuts: TipTap's StarterKit + Underline already provide Ctrl+B/I/U; verify no conflicts.
3. CSS: toolbar wrapper has `class="editor-toolbar"` so feature 17 print CSS hides it.
4. Verify VariableSpan atomicity:
   - Toggle list on a paragraph containing a VariableSpan — span attributes survive.
   - Apply alignment — span attributes survive.
   - If issues, set `keepOnSplit: true` on the mark (feature 08).

## Verification
- Each button toggles formatting on selection.
- Active state in toolbar reflects cursor position.
- List conversion preserves variable spans inside the paragraph.
- Manual edits persist after Save and appear in preview/print.
- Toolbar absent in `@media print` (handled in feature 17 via `display:none`).
