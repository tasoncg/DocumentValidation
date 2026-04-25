# Plan: 07 — Template delete

## Dependencies
- 04 (row action lives in template list)

## Files to add
- `components/templates/delete-template-dialog.tsx` — shadcn `AlertDialog`
- `app/(app)/templates/actions.ts` — extend with `deleteTemplate(id)`
- `server/templates.ts` — extend with `deleteTemplate(id, userId)` and `countCases(templateId)`

## Implementation steps
1. `server/templates.ts`:
   ```ts
   export async function deleteTemplate(id: string, userId: string) {
     const t = await prisma.documentTemplate.findUnique({ where: { id } });
     if (!t || t.createdById !== userId) throw new Error('FORBIDDEN');
     await prisma.documentTemplate.delete({ where: { id } });
   }
   ```
   Cascade in schema (feature 02) handles Variables, Cases, CaseValues.
2. Server action `deleteTemplate(formData)`:
   - `getCurrentUser()`; call server fn; map `FORBIDDEN` to `{ error: 'forbidden' }`; `revalidatePath('/templates')`.
3. `DeleteTemplateDialog` (client):
   - Props: `template: { id, name, caseCount }`, `onConfirmed?`.
   - Body shows: "Xoá `${name}`?" + warning if `caseCount > 0`: "Sẽ xoá ${caseCount} biên bản đã tạo từ văn bản này."
   - Confirm button calls action; on success toast + close + `router.refresh()`.
4. Wire from `TemplateTable` row action button → opens dialog with row data.
5. Toast variants: success (`"Đã xoá văn bản"`), error (`"Không thể xoá"` or specific).

## Verification
- Confirmation lists exact case count.
- Logged-in user who is not owner → server action returns forbidden, no DB change.
- Row disappears without full page reload (uses `router.refresh`).
- Cascade: child rows (variables, cases, case values) gone after delete (verify in DB once).
