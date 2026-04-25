# Plan: 17 — Print flow & print CSS

## Dependencies
- 15 (PrintableDocument), 16 (preview consistency)

## Files to add
- `app/(print)/cases/[id]/preview-print/page.tsx`
- `components/cases/auto-print.tsx` — client trigger
- `app/(print)/print.css` — `@media print` rules
- Update `server/cases.ts` — add `markPrinted(id, userId)`

## Implementation steps
1. `/preview-print/page.tsx` (RSC, under `(print)` layout, no chrome):
   - Fetch case + verify owner.
   - Render:
     ```tsx
     <>
       <AutoPrint caseId={case.id} />
       <PrintableDocument html={case.finalContentHtml} />
     </>
     ```
   - Import `print.css`.
2. `AutoPrint` (client):
   ```tsx
   useEffect(() => {
     let printed = false;
     const trigger = () => {
       if (printed) return;
       printed = true;
       window.print();
       fetch(`/api/cases/${caseId}/printed`, { method: 'POST' }).catch(() => {});
     };
     if (document.fonts?.ready) {
       document.fonts.ready.then(trigger);
     } else {
       setTimeout(trigger, 300);
     }
   }, []);
   return <button className="screen-only" onClick={() => window.print()}>In</button>;
   ```
   `.screen-only { @media print { display: none; } }`.
3. `app/api/cases/[id]/printed/route.ts` — POST `markPrinted` (`printedAt = now()`); ignore failures silently.
4. `print.css`:
   ```css
   @media print {
     @page { size: A4; margin: 20mm; }
     html, body { background: white !important; }
     nav, header, aside, .editor-toolbar, .top-panel, .preview-backdrop > :not(.preview-page-wrapper),
     .var-highlight, .var-highlight-active { display: none !important; }
     .printable.a4 { box-shadow: none !important; padding: 0 !important; width: auto !important; min-height: 0 !important; }
     .ProseMirror > *::before { content: none !important; }
     table, tr { break-inside: avoid; }
     p { orphans: 2; widows: 2; }
     /* preserve formatting — no overrides on font/spacing/borders */
   }
   ```
5. After auto-print, do not block the page; if user dismisses dialog they still see the document.

## Verification
- Browser print preview shows only the document (no buttons, sidebar, highlights, or paragraph markers).
- `@page` is A4 with 20mm margins.
- PDF output (Print → Save as PDF) visually matches preview.
- `case.printedAt` updates after a real print event (best-effort; not blocking).
- README (feature 19) tells users to disable browser default header/footer.
