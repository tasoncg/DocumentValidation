# 02 — Database schema (Prisma)

Refs: appspec §5, §15.

## Goal
A Prisma schema that models all five entities with correct relations and runs on SQLite locally and Postgres in production.

## Scope
- `prisma/schema.prisma` with models:
  - `User` — id, email (unique), passwordHash, fullName, role, createdAt, updatedAt.
  - `DocumentTemplate` — id, orderNumber (auto-increment), name, originalFileName, contentHtml (Text), createdById (→ User), lastUsedAt, timestamps.
  - `DocumentVariable` — id, templateId (→ Template, cascade delete), name, dataType (default `nvarchar`), originalText, placeholderKey, appearanceCount, timestamps.
  - `ViolationCase` — id, templateId, officerId, caseNumber (nullable), finalContentHtml (Text), createdAt, updatedAt, printedAt (nullable).
  - `ViolationCaseValue` — id, caseId (→ Case, cascade), variableId (→ Variable), value.
- Datasource toggle via `DATABASE_URL` (sqlite local, postgres prod).
- Initial migration committed.
- `prisma/seed.ts` creates the demo user.
- Indexes: `@@index([createdById])` on Template, `@@index([templateId])` on Variable & Case, `@@unique([caseId, variableId])` on CaseValue.

## Out of scope
- Soft delete, audit log, attachments table.

## Acceptance criteria
- `npx prisma migrate dev` creates a clean DB.
- `npx prisma db seed` produces the demo officer.
- Cascade: deleting a Template removes its Variables; deleting a Case removes its CaseValues.
- Schema generates types used by all later features.

## Notes
- `placeholderKey` is the stable token used inside `<span data-placeholder-key>` so HTML is portable across DBs.
- `orderNumber` should be DB-generated to avoid race conditions on concurrent creates.
