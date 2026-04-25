# Plan: 05 — `.docx` upload & parse

## Dependencies
- 02 (no DB write here, but feature 06 will persist)

## Files to add
- `lib/docx.ts` — `parseDocx(buffer): Promise<{ html, originalFileName }>`
- `lib/sanitize.ts` — shared HTML allowlist (also reused by feature 15)
- `app/api/templates/parse/route.ts` — POST multipart/form-data
- `components/templates/upload-button.tsx` — file input + onParsed callback

## Implementation steps
1. Install: `mammoth`, `sanitize-html`, `@types/sanitize-html`.
2. `lib/docx.ts`:
   ```ts
   import mammoth from 'mammoth';
   export async function parseDocx(buffer: Buffer, originalFileName: string) {
     const styleMap = [
       "p[style-name='Heading 1'] => h1",
       "p[style-name='Heading 2'] => h2",
       "u => u",
       "b => strong",
       "i => em",
     ];
     const { value } = await mammoth.convertToHtml({ buffer }, { styleMap });
     return { html: sanitize(value), originalFileName };
   }
   ```
3. `lib/sanitize.ts`: allow `p, h1..h6, strong, em, u, br, ul, ol, li, table, thead, tbody, tr, td, th, span, div`; allowed attrs `style` (limited to `text-align`, `font-weight`, `font-style`, `text-decoration`), `data-var-id`, `data-placeholder-key`, `data-original-value`, `class` (allowlisted).
4. `app/api/templates/parse/route.ts`:
   - Auth-gate via `getCurrentUser()`.
   - `formData.get('file')` → check ext `.docx`, MIME `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, size ≤ 10 MB.
   - On reject: `NextResponse.json({ error }, { status: 400 })`.
   - Convert to `Buffer.from(await file.arrayBuffer())`, call `parseDocx`, return JSON.
5. `UploadButton`: hidden `<input type="file" accept=".docx">`; on change → FormData → `fetch('/api/templates/parse', { method: 'POST', body })` → `props.onParsed({ html, originalFileName })`. Show toast on error.

## Verification
- Real biên bản `.docx` parses; tables render as `<table>`.
- `.pdf` upload rejected with toast; no DB write.
- Parse runs server-side only (no mammoth in client bundle — keep import inside route handler).
- HTML output passes through sanitize and renders in TipTap (feature 08) without console errors.

## Notes
- Image/media extraction punted; mammoth's default drops them safely.
- Keep `parseDocx` pure so it can move to a worker later.
