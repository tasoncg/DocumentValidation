# Plan: 18 — Missing-variable validation

## Dependencies
- 12 (case top panel), 13 (live values)

## Files to add
- `lib/missing-variables.ts`
- `components/cases/missing-vars-dialog.tsx`
- Update `components/cases/case-top-panel.tsx` — empty badge + Preview/Print gating
- `components/cases/empty-var-screen.css` — screen-only highlight class

## Implementation steps
1. `lib/missing-variables.ts`:
   ```ts
   export function getMissingVariables(
     variables: { id: string; name: string }[],
     values: Record<string, string>,
   ) {
     return variables.filter(v => !values[v.id] || values[v.id].trim() === '');
   }
   ```
2. `MissingVarsDialog` (shadcn AlertDialog):
   - Props: `{ open, missing, onCancel, onContinue }`.
   - Body: list of `missing.map(v => v.name)` with red dot.
   - Buttons: Cancel (default), "Tiếp tục" (destructive variant).
3. `CaseTopPanel` updates:
   - Compute `missing = getMissingVariables(variables, values)` on every render.
   - Variable input row: red dot icon when this variable is in `missing`.
   - On Preview click:
     - First, force flush editor: read `editorRef.current.getHTML()` and trigger save (or pass HTML via search param too risky; instead always save before nav).
     - If `missing.length > 0`: open dialog.
     - On Cancel → stop. On Continue → flush + `router.push('/cases/${id}/preview?allow_missing=1')`.
   - On Print click: same flow → `/cases/${id}/preview-print`.
4. On preview page (feature 16), if `searchParams.allow_missing === '1'`, add a class `data-empty-vars` to the wrapper; CSS in `empty-var-screen.css`:
   ```css
   .preview-backdrop[data-empty-vars] [data-var-id]:empty,
   .preview-backdrop[data-empty-vars] .var-empty { background: #fee2e2; outline: 1px dashed #ef4444; }
   @media print {
     [data-empty-vars] [data-var-id], [data-empty-vars] .var-empty {
       background: transparent !important; outline: none !important;
     }
   }
   ```
   Mark empty spans during render: at the moment of replacement (feature 13), if value is empty AND user clicked Continue, add `var-empty` class to spans (cleared otherwise).

## Verification
- Click Preview while a variable is empty → modal lists exact variable names.
- Cancel keeps user on case page; Continue navigates to preview.
- Filling in the input clears the red dot in the panel.
- On preview, empty spans are highlighted on screen; `@media print` removes the highlight.
- Force-save runs before navigation so manual edits aren't lost.
