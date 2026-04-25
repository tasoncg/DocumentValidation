# Plan: 15 — `PrintableDocument` shared component

## Dependencies
- 02 (case data), 05 (sanitize util)

## Files to add
- `components/printable-document.tsx`
- `components/printable-document.css` — A4 page CSS vars + base typography
- `lib/strip-editor-artifacts.ts` — pre-render cleaner

## Implementation steps
1. `lib/strip-editor-artifacts.ts`:
   - Run on the client (uses `DOMParser`) or use `sanitize-html` transform on server.
   - Steps:
     - Parse HTML.
     - Remove classes `var-highlight`, `var-highlight-active`, `paragraph-marker`.
     - For all elements, drop attributes starting with `data-tiptap-*` or other editor-only.
     - Optionally strip `data-var-id` and `data-placeholder-key` (keep only if traceability needed; spec says "do not render markers" so safe to strip).
     - Serialize back.
   - Then pass through shared `sanitize()` from feature 05.
2. `PrintableDocument`:
   ```tsx
   export function PrintableDocument({ html }: { html: string }) {
     const cleaned = useMemo(() => sanitize(stripEditorArtifacts(html)), [html]);
     return (
       <article className="printable a4" dangerouslySetInnerHTML={{ __html: cleaned }} />
     );
   }
   ```
   - No interactive children, no buttons, no event handlers.
3. `printable-document.css` — exposes CSS vars used by both preview and print:
   ```css
   :root {
     --page-width: 210mm;
     --page-height: 297mm;
     --page-margin: 20mm;
   }
   .printable.a4 {
     width: var(--page-width);
     min-height: var(--page-height);
     padding: var(--page-margin);
     background: white;
     box-sizing: border-box;
     font-family: 'Times New Roman', Times, serif;
     font-size: 13pt;
     line-height: 1.5;
   }
   .printable p { margin: 0 0 0.5em; }
   .printable table { border-collapse: collapse; width: 100%; }
   .printable td, .printable th { border: 1px solid #000; padding: 4px 6px; }
   ```

## Verification
- `<PrintableDocument html={sameHtml} />` renders identically on `/preview` and `/preview-print`.
- No `.var-highlight*` classes survive.
- No paragraph-marker pseudo-elements visible.
- Component contains zero interactive elements (search the JSX).

## Notes
- Single source of truth for layout — feature 16 wraps with backdrop, feature 17 layers print CSS.
- Sanitize twice (mammoth output + here) — defense in depth, cheap.
