# Plan: 04 — Template list

## Dependencies
- 01, 02, 03

## Files to add
- `app/(app)/templates/page.tsx` — RSC, fetch + render
- `app/(app)/templates/loading.tsx` — skeleton
- `components/templates/template-table.tsx` — client (search, render rows)
- `components/templates/empty-state.tsx`
- `server/templates.ts` — `listTemplatesForUser(userId)` returns `(Template & { _count: { cases } })[]`

## Implementation steps
1. `server/templates.ts`:
   ```ts
   prisma.documentTemplate.findMany({
     where: { createdById: userId },
     include: { _count: { select: { cases: true } } },
     orderBy: { lastUsedAt: { sort: 'desc', nulls: 'last' } },
   })
   ```
   (Add Prisma relation alias `cases` on Template.)
2. `/templates/page.tsx`: `const user = await getCurrentUser(); const rows = await listTemplatesForUser(user.id);` → render `<TemplateTable rows={rows} />` or `<EmptyState />` if length 0.
3. `TemplateTable` client:
   - `useState('')` for query.
   - Filter: `r => r.name.toLowerCase().includes(q.toLowerCase()) || String(r.orderNumber) === q.trim()`.
   - shadcn `Table` with columns: STT, Tên, Số case (`_count.cases`), Lần dùng cuối (`lastUsedAt` formatted via `Intl.DateTimeFormat('vi-VN')` or `date-fns`), Actions.
   - Row actions: Tạo văn bản → `Link` to `/templates/${id}/cases/new`; Edit → `/templates/${id}/edit`; Xoá → opens dialog from feature 07.
4. Header bar: `<Button asChild><Link href="/templates/new">Tạo mới văn bản mẫu</Link></Button>` + search `<Input>`.
5. `loading.tsx` returns table skeleton (5 rows).
6. `EmptyState`: illustration + CTA button to `/templates/new`.

## Verification
- New template shows top after `lastUsedAt` set on first save.
- Case count column equals `prisma.violationCase.count({ where: { templateId } })`.
- Search by partial name (case-insensitive) and by full orderNumber both filter rows.
- 0 templates → empty state visible, no table rendered.
