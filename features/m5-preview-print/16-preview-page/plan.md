# Plan: 16 — Preview page (A4 on screen)

## Dependencies
- 12 (case data), 15 (PrintableDocument), 18 (validation gate at navigation source)

## Files to add
- `app/(app)/cases/[id]/preview/page.tsx`
- `components/cases/preview-toolbar.tsx`
- `app/(app)/cases/[id]/preview/preview.css` — gray backdrop, page shadow

## Implementation steps
1. `/cases/[id]/preview/page.tsx` (RSC):
   - `getCurrentUser()`; fetch case w/ template name + caseNumber.
   - Verify owner; else `notFound()`.
   - Render:
     ```tsx
     <div className="preview-backdrop">
       <PreviewToolbar caseId={case.id} templateName={template.name} caseNumber={case.caseNumber} />
       <div className="preview-page-wrapper">
         <PrintableDocument html={case.finalContentHtml} />
       </div>
     </div>
     ```
2. `PreviewToolbar` (client):
   - Buttons: Back (`router.back()`), In (`router.push('/cases/${id}/preview-print')`).
   - Label: `${templateName} — ${caseNumber ?? 'Chưa đặt số'}`.
3. `preview.css`:
   ```css
   .preview-backdrop { background: #e5e7eb; min-height: 100vh; padding: 2rem 0; }
   .preview-page-wrapper { display: flex; justify-content: center; }
   .preview-page-wrapper .printable.a4 {
     box-shadow: 0 4px 24px rgba(0,0,0,0.15);
   }
   ```
4. Validation: feature 18 already blocked navigation if missing variables. The preview page itself does **not** need to recheck because it's read-only of `finalContentHtml` (already saved). Optional: re-warn via inline banner if any `data-var-id` text equals the variable's `originalValue` AND value field empty — but spec says screen-only highlight is fine. Skip the banner for MVP unless quick.

## Verification
- Page width matches A4 (`210mm`); margin equals `--page-margin`.
- No editor toolbar, sidebar, or paragraph markers visible.
- Variables rendered with replaced values; manual edits visible.
- Click "In" navigates to `/cases/[id]/preview-print` (feature 17).
- Toolbar lives **outside** the `.printable.a4` element (so it'd not affect print, though print uses a separate route anyway).
