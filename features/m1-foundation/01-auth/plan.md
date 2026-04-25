# Plan: 01 — Auth

## Dependencies
- 02 (User model must exist before seed/login query)
- 03 (`(auth)/layout.tsx` for /login chrome; `(app)/layout.tsx` calls `getServerSession`)

## Files to add
- `lib/password.ts` — `hashPassword`, `verifyPassword` (bcryptjs)
- `lib/auth.ts` — NextAuth config, Credentials provider, JWT session strategy
- `app/api/auth/[...nextauth]/route.ts` — NextAuth handler
- `app/(auth)/login/page.tsx` — client form (Email, Password, Submit)
- `middleware.ts` — protect `/templates/:path*`, `/cases/:path*`; redirect to `/login`
- `prisma/seed.ts` — create `officer@example.com` / `Password123!` (role `officer`)
- `.env.example` — `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

## Implementation steps
1. Install: `next-auth`, `bcryptjs`, `@types/bcryptjs`.
2. `lib/password.ts`: `hashPassword(plain)` (10 rounds), `verifyPassword(plain, hash)`.
3. `lib/auth.ts`: Credentials provider — `authorize({ email, password })` looks up user, runs `verifyPassword`, returns `{ id, email, fullName, role }` or `null`. Add JWT + session callback to expose `user.id` and `user.role`.
4. Wire `app/api/auth/[...nextauth]/route.ts` exporting `GET`, `POST` from `NextAuth(authOptions)`.
5. Login page: shadcn `Form` + `Input` + `Button`. Submit → `signIn('credentials', { redirect: false, email, password })`. On error → toast “Sai email hoặc mật khẩu”. On success → `router.push('/templates')`.
6. `middleware.ts`: `withAuth` from `next-auth/middleware` with matcher `['/templates/:path*', '/cases/:path*']`.
7. Logout (used by feature 03 header): `signOut({ callbackUrl: '/login' })`.
8. Seed: hash `Password123!`, upsert demo user.

## Verification
- `npx prisma db seed` → demo user exists.
- Login with demo creds → lands on `/templates`.
- Wrong password → friendly toast, no stack trace.
- Visit `/templates` while logged out → redirected to `/login`.
- Logout returns to `/login` and clears session cookie.
