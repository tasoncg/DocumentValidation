# Document Violation Manager

Web app SaaS giúp cán bộ tạo, cấu hình và in biên bản vi phạm từ file Word mẫu — thay thế cách sửa thủ công file `.docx`. Cấu hình variable một lần, app sẽ thay thế đồng bộ ở mọi vị trí trong văn bản.

## Yêu cầu

- Node.js ≥ 20
- npm ≥ 10

## Chạy local

```bash
cp .env.example .env
# Điền DATABASE_URL + DIRECT_URL trỏ tới Supabase (xem mô tả trong .env.example).
# Sinh NEXTAUTH_SECRET:
#   Linux/Mac: openssl rand -base64 32
#   Windows:   [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

npm install
npx prisma generate
npm run db:push     # đồng bộ schema lên Postgres (lần đầu)
npx prisma db seed  # seed user demo (chạy 1 lần)
npm run dev
```

Mở http://localhost:3000 và đăng nhập:

- Email: `officer@example.com`
- Password: `Password123!`

> ⚠️ **Local trỏ thẳng tới Postgres prod** — mọi thao tác ghi (kể cả `prisma db push`) đều ảnh hưởng dữ liệu thật. Cẩn thận khi chạy script.

## Cấu hình DB

Hai connection string cùng host Supabase, khác mode:

| Var | Port | Mode | Dùng cho |
|---|---|---|---|
| `DATABASE_URL` | 6543 | Transaction (PgBouncer) | Runtime queries — phải có `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | 5432 | Session pooler | `prisma db push`, migrations, seed |

Lý do tách: PgBouncer transaction-mode không hỗ trợ session-level lock mà Prisma cần khi sửa schema.

## Deploy lên Vercel

1. Push repo lên GitHub — Vercel auto-deploy `main`.
2. Env vars Vercel (đã set):
   - `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
3. Build command (`npm run build`) tự chạy `prisma db push` để đồng bộ schema khi schema thay đổi.

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
| `npm run build` | Prisma generate + db push + Next build |
| `npm run start` | Chạy production build |
| `npm run db:push` | Đồng bộ schema → Postgres (`prisma db push`) |
| `npm run db:seed` | Seed user demo |
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
