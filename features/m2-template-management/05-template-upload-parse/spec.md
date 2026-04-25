# 05 — `.docx` upload & parse to HTML

Refs: appspec §4 (file processing), §12, §13 (project output).

## Goal
Officer uploads a `.docx`; the system converts it to editable HTML preserving the formatting we care about.

## Scope
- File input accepts only `.docx`; reject other types with a clear toast.
- Server route handler / server action accepts `multipart/form-data`.
- Use `mammoth` to convert docx → HTML.
- Mammoth style map preserves: paragraphs, bold, italic, underline, alignment (where Word stores it as direct formatting), line breaks, basic tables.
- Sanitize the HTML output (e.g. with `sanitize-html` or a custom allowlist) — strip script/style/event handlers; keep `style` only for safe properties (text-align, font-weight, etc.).
- Return `{ html, originalFileName }` to the client; the caller (feature 06) decides whether to persist.
- Reasonable file-size limit (e.g. 10 MB) with a friendly error.

## Out of scope
- `.doc` legacy format, RTF, PDF.
- Round-trip back to `.docx` (appspec §12 marks it optional).
- Image extraction/rendering (not required for biên bản; punt unless trivial).

## Acceptance criteria
- A representative biên bản `.docx` round-trips into HTML that the editor can render readably.
- Tables in the source render as `<table>` with rows/cells.
- Uploading a non-docx file is rejected before any DB write.
- The parse runs server-side; the docx blob is not stored unless a future storage feature requires it.

## Notes
- Keep the parser behind `lib/docx.ts` so it can be swapped (e.g. for a worker) later.
