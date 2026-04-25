# Plan: 19 — README & Vercel deployment

## Dependencies
- All previous features completed (this is the shipping wrapper).

## Files to add
- `README.md`
- `.env.example`
- Update `package.json` — scripts
- `.gitignore` — ensure `.env`, `dev.db`, `.next/`, `node_modules/` ignored

## Implementation steps
1. `package.json` scripts:
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "prisma generate && prisma migrate deploy && next build",
       "start": "next start",
       "db:migrate": "prisma migrate dev",
       "db:seed": "prisma db seed",
       "db:reset": "prisma migrate reset",
       "lint": "next lint",
       "typecheck": "tsc --noEmit",
       "test": "vitest"
     },
     "prisma": { "seed": "tsx prisma/seed.ts" }
   }
   ```
2. `.env.example`:
   ```
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET=""   # openssl rand -base64 32
   NEXTAUTH_URL="http://localhost:3000"
   ```
3. `README.md` sections:
   - **Giới thiệu** — 3 dòng tóm tắt MVP.
   - **Yêu cầu** — Node ≥ 20, npm ≥ 10.
   - **Chạy local**:
     1. `cp .env.example .env`
     2. `npm install`
     3. `npx prisma migrate dev`
     4. `npx prisma db seed`
     5. `npm run dev`
     6. Login: `officer@example.com` / `Password123!`.
   - **Cấu hình DB** — SQLite mặc định; chuyển sang Postgres/Supabase: đổi `provider = "postgresql"` trong `prisma/schema.prisma` và `DATABASE_URL`. Lưu ý connection pooling (Supabase pgbouncer) cho Vercel: `?pgbouncer=true&connection_limit=1`.
   - **Deploy Vercel**:
     1. Push repo lên GitHub.
     2. Import project trên Vercel; Framework: Next.js.
     3. Env vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (= deploy URL).
     4. Build command đã có `prisma migrate deploy` — tự chạy migration trên mỗi deploy.
     5. (Lần đầu) chạy seed bằng `npx prisma db seed` qua Vercel CLI hoặc một lần local trỏ tới prod DB.
   - **In văn bản đúng cách**:
     - Trong dialog Print của browser: tắt Headers and footers.
     - Margins: Default (CSS đã set `@page` margin).
     - Paper: A4.
     - Bật Background graphics nếu cần preserve table border/shading.
   - **Cấu trúc thư mục** — bullet list các folder chính (`/app`, `/components`, `/lib`, `/server`, `/prisma`, `/features`).
   - **Scripts** — bảng lệnh ↔ mục đích.
4. `.gitignore`: `node_modules`, `.next`, `.env`, `*.db`, `.vercel`.

## Verification
- Clone repo trên máy mới → làm theo README → app chạy localhost, login OK.
- Deploy lên Vercel với Postgres URL → deploy build chạy migrate, app online, login demo OK.
- Print test: làm theo "In văn bản đúng cách" → output không có URL/trang/header browser, layout giống preview.
