# Plan: 02 — Database schema

## Dependencies
- None (foundational)

## Files to add
- `prisma/schema.prisma`
- `prisma/seed.ts` (created here, populated further by 01)
- `.env` — `DATABASE_URL="file:./dev.db"`
- `.env.example` — same key
- `package.json` — add `prisma.seed`, scripts `db:migrate`, `db:seed`, `db:reset`

## Implementation steps
1. `npm i -D prisma`, `npm i @prisma/client`.
2. `npx prisma init --datasource-provider sqlite`.
3. Define enum `Role { officer admin }`.
4. Models per spec:
   - `User` (email `@unique`, `passwordHash`, `fullName`, `role Role @default(officer)`, timestamps).
   - `DocumentTemplate` (`orderNumber Int @default(autoincrement()) @unique`, `name`, `originalFileName`, `contentHtml String`, `createdById` → User, `lastUsedAt DateTime?`, `@@index([createdById])`). Cast `contentHtml` to `@db.Text` only on Postgres later.
   - `DocumentVariable` (`templateId` → Template `onDelete: Cascade`, `name`, `dataType String @default("nvarchar")`, `originalText`, `placeholderKey @unique`, `appearanceCount Int`, `@@index([templateId])`, `@@unique([templateId, name])`).
   - `ViolationCase` (`templateId` → Template, `officerId` → User, `caseNumber String?`, `finalContentHtml String`, `printedAt DateTime?`, `@@index([templateId])`, `@@index([officerId])`).
   - `ViolationCaseValue` (`caseId` → Case `onDelete: Cascade`, `variableId` → Variable, `value String`, `@@unique([caseId, variableId])`).
5. `npx prisma migrate dev --name init`.
6. `prisma/seed.ts` skeleton (filled by feature 01): `tsx prisma/seed.ts`.
7. `package.json` → `"prisma": { "seed": "tsx prisma/seed.ts" }`, scripts `db:migrate`, `db:seed`, `db:reset`.

## Verification
- `npx prisma migrate dev` produces clean SQLite DB.
- `npx prisma db seed` runs without error.
- Manual check: insert Template + Variable + Case; delete Template → child rows gone (cascade).
- Generated `@prisma/client` types compile in `tsc --noEmit`.

## Notes
- Provider switch (sqlite ↔ postgresql) requires editing `provider` literal — documented in feature 19 README, not auto-toggled.
- Keep `placeholderKey` globally unique so HTML stays portable across templates.
