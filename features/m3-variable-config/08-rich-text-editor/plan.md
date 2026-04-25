# Plan: 08 — Rich text editor (TipTap)

## Dependencies
- None structural; consumed by 06, 09, 11, 12, 13, 14.

## Files to add
- `components/editor/rich-editor.tsx` — main component (forwardRef)
- `components/editor/extensions/variable-span.ts` — custom Mark
- `components/editor/paragraph-marker.css` — gutter counter
- `components/editor/types.ts` — exported `RichEditorHandle`

## Implementation steps
1. Install:
   `@tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-text-align @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header`.
2. `extensions/variable-span.ts` — define a TipTap **Mark** named `variableSpan`:
   ```ts
   addAttributes() { return { varId: { default: null, parseHTML: el => el.getAttribute('data-var-id'), renderHTML: a => ({ 'data-var-id': a.varId }) }, placeholderKey: ..., originalValue: ... }; }
   parseHTML() { return [{ tag: 'span[data-var-id]' }]; }
   renderHTML({ HTMLAttributes }) { return ['span', mergeAttributes(HTMLAttributes, { class: 'var-span' }), 0]; }
   ```
   For case page atomicity: implement as a separate **Node** (atom: true, inline: true) and pick the node vs mark via the editor's `mode` prop; OR keep as Mark and rely on TipTap's `keepOnSplit: false` + custom `keydown` handler to prevent splitting. **Pick Mark for MVP simplicity**; document the trade-off.
3. `RichEditor`:
   - Props: `{ html?: string, editable?: boolean, mode: 'template' | 'case', onChange?: (html) => void, slot?: ReactNode (toolbar) }`.
   - `useEditor({ extensions: [StarterKit, Underline, TextAlign, Table, TableRow, TableCell, TableHeader, VariableSpan], content: html, editable })`.
   - `useImperativeHandle(ref, () => ({ getHTML, setHTML, getSelectionText, scrollToVarOccurrence, highlightVar, clearHighlight }))`.
   - `getSelectionText()`: `editor.state.doc.textBetween(from, to, ' ')`.
   - `scrollToVarOccurrence(varId, idx)`: `editorEl.querySelectorAll(\`[data-var-id="${varId}"]\`)[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' })`.
   - `highlightVar`/`clearHighlight` implemented for feature 11 here.
4. Paragraph markers — pure CSS in `paragraph-marker.css`:
   ```css
   .ProseMirror { counter-reset: para; }
   .ProseMirror > p, .ProseMirror > h1, .ProseMirror > h2, .ProseMirror > ul, .ProseMirror > ol, .ProseMirror > table { counter-increment: para; position: relative; }
   .ProseMirror > *[counter-increment]::before { content: counter(para); position: absolute; left: -2.5rem; color: #999; font-size: 0.75rem; }
   @media print { .ProseMirror > *::before { content: none !important; } }
   ```
5. Sanitize on `getHTML()`: pass through `lib/sanitize.ts` to defense-in-depth.

## Verification
- HTML from mammoth renders without console errors.
- `getSelectionText()` returns exact substring.
- Round-trip: `setHTML(getHTML())` produces same DOM.
- Markers visible in browser; absent in `@media print`.
- VariableSpan attributes survive save/load.

## Notes
- Pure component — no fetch, no router. Pages own data.
