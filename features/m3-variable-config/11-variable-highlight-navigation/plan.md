# Plan: 11 — Highlight & Next/Previous navigation

## Dependencies
- 08 (RichEditor exposes API), 09 (variable list rows trigger calls)

## Files to add
- `components/editor/highlight.css` — `.var-highlight`, `.var-highlight-active` styles
- Update `components/editor/rich-editor.tsx` — implement `highlightVar`, `clearHighlight`, `scrollToVarOccurrence`
- Update `components/templates/variable-list.tsx` — Next/Prev controls
- Update `components/cases/case-top-panel.tsx` (feature 12) — same controls

## Implementation steps
1. `highlight.css`:
   ```css
   .ProseMirror .var-highlight { background: #fff3a3; border-radius: 2px; }
   .ProseMirror .var-highlight-active { background: #ffd54f; outline: 2px solid #f59e0b; }
   @media print {
     .ProseMirror .var-highlight,
     .ProseMirror .var-highlight-active { background: transparent !important; outline: none !important; }
   }
   ```
2. `RichEditor` API additions:
   ```ts
   const highlightVar = (varId: string) => {
     clearHighlight();
     editorEl.querySelectorAll(`[data-var-id="${varId}"]`)
       .forEach(el => el.classList.add('var-highlight'));
   };
   const clearHighlight = () => {
     editorEl.querySelectorAll('.var-highlight, .var-highlight-active')
       .forEach(el => el.classList.remove('var-highlight', 'var-highlight-active'));
   };
   const scrollToVarOccurrence = (varId, idx) => {
     const nodes = editorEl.querySelectorAll(`[data-var-id="${varId}"]`);
     nodes.forEach(n => n.classList.remove('var-highlight-active'));
     const target = nodes[idx];
     target?.classList.add('var-highlight-active');
     target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
   };
   ```
   These mutate DOM directly (not Prosemirror state) — purely cosmetic, won't be saved (CSS classes excluded from `getHTML` via TipTap's renderHTML which only outputs declared attrs).
3. Variable list row state (in feature 09 + 12 panels):
   - `activeVarId`, `currentIndex` per panel.
   - Click row → `highlightVar(id)`, `currentIndex = 0`, `scrollToVarOccurrence(id, 0)`.
   - Next: `idx = (idx + 1) % count`; Prev: `idx = (idx - 1 + count) % count`; then scroll.
   - Click another row or click outside (panel `onBlur` hard to detect; use explicit "Clear" or auto-clear on input change).
4. Edge case: when variables are added/removed, recompute `count` from DOM (`querySelectorAll(...).length`).

## Verification
- Variable with 5 occurrences → 5 `.var-highlight` elements.
- Next cycles 1→2→3→4→5→1; Prev cycles in reverse; active class moves accordingly.
- Switching to another variable removes prior highlights.
- Print output (feature 17) shows no yellow background — verified via browser print preview.
