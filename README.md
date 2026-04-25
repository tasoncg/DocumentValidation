# Document Violation Manager

Web app SaaS giúp cán bộ tạo, cấu hình và in biên bản vi phạm từ file Word mẫu — thay thế cách sửa thủ công file `.docx`. Cấu hình variable một lần, app sẽ thay thế đồng bộ ở mọi vị trí trong văn bản.

## Yêu cầu

- Node.js ≥ 20
- npm ≥ 10

## Chạy local

```bash
cp .env.example .env
# Sinh secret cho NextAuth (Linux/Mac):
#   openssl rand -base64 32
# Trên Windows PowerShell:
#   [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
# Paste vào NEXTAUTH_SECRET trong .env

npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Mở http://localhost:3000 và đăng nhập:

- Email: `officer@example.com`
- Password: `Password123!`

## Cấu hình DB

Mặc định dùng **SQLite** (`file:./dev.db`). Để chuyển sang **Postgres / Supabase**:

1. Sửa `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Sửa `DATABASE_URL` thành Postgres URL. Khi deploy Vercel + Supabase, dùng connection pooling:
   ```
   postgresql://USER:PASS@HOST:6543/postgres?pgbouncer=true&connection_limit=1
   ```
3. `npx prisma migrate dev --name init_postgres`.

## Deploy lên Vercel

1. Push repo lên GitHub.
2. Import project trên Vercel; framework: Next.js.
3. Set env vars trên Vercel:
   - `DATABASE_URL` — Postgres URL (Supabase / Neon / Railway).
   - `NEXTAUTH_SECRET` — sinh giống local.
   - `NEXTAUTH_URL` — URL deploy (https://your-app.vercel.app).
4. Build command đã có `prisma migrate deploy`, migration chạy tự động khi deploy.
5. Lần đầu cần seed user demo: chạy local trỏ tới Postgres prod hoặc dùng Vercel CLI:
   ```
   DATABASE_URL="<prod url>" npx prisma db seed
   ```

## In văn bản đúng cách

Khi mở dialog Print của browser:

- **Bỏ tick** "Headers and footers" để bản in không có URL/ngày/trang của browser.
- **Margins**: Default (CSS đã set `@page { size: A4; margin: 20mm }`).
- **Paper**: A4.
- **Background graphics**: ON nếu cần preserve viền bảng / màu nền.
- Có thể save thẳng sang PDF từ dialog Print (Save as PDF).

## Cấu trúc thư mục

```
app/                 Next.js App Router routes (auth, app, print groups)
  (app)/             Authenticated pages — header, container
  (auth)/            Login
  (print)/           Bare layout for /preview-print
  api/               Route handlers (parse docx, mark printed, NextAuth)
components/          UI + feature-specific components
  ui/                shadcn/ui primitives
  editor/            TipTap editor + toolbar + VariableSpan mark
  templates/         Template list, editor, variable modal
  cases/             Case page, panel, missing-vars dialog, auto-print
lib/                 Pure utilities (sanitize, docx, variable-suggest, ...)
server/              Server-side data layer (Prisma queries)
prisma/              schema.prisma + seed
features/            Feature spec.md and plan.md per feature
```

## Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Next.js dev server (localhost:3000) |
| `npm run build` | Prisma generate + migrate deploy + Next build |
| `npm run start` | Chạy production build |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:seed` | Seed user demo |
| `npm run db:reset` | Reset & re-migrate DB (xoá hết data!) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest |

## Acceptance criteria (theo appspec §16)

- [x] Đăng nhập với demo user → `/templates`.
- [x] Upload `.docx` → mammoth parse → HTML editor.
- [x] Đặt tên + lưu template.
- [x] Bôi đen text → modal cấu hình variable → wrap span tất cả vị trí.
- [x] Đếm số lần xuất hiện + Next/Previous như Ctrl+F.
- [x] Tạo biên bản từ template.
- [x] Nhập value 1 lần → replace tất cả vị trí linked tức thời.
- [x] Sửa thủ công bất kỳ chỗ nào trong editor.
- [x] Preview A4 + CSS shared với bản in.
- [x] In đúng như preview.
- [x] Cảnh báo nếu còn variable trống trước khi preview/print.
