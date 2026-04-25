# 04 — Template list (Dashboard)

Refs: appspec §6.2.

## Goal
At `/templates`, an officer sees all saved templates and can search, open, edit, delete, or create one.

## Scope
- Route `/templates` (server component) loads templates owned by current user.
- Table columns: Số thứ tự (orderNumber), Tên văn bản, Số lượng trường hợp đã tạo (count of cases), Thời gian sử dụng gần nhất (`lastUsedAt`), Actions.
- Action buttons per row: **Tạo văn bản** → `/templates/[id]/cases/new`; **Edit** → `/templates/[id]/edit`; **Xoá** → confirm dialog (delegated to feature 07).
- Search input filters by name (case-insensitive) and by exact `orderNumber`.
- Header button **“Tạo mới văn bản mẫu”** → `/templates/new`.
- Empty state with CTA when there are no templates.
- Loading skeleton on first paint.

## Out of scope
- Pagination, sorting beyond default (lastUsedAt desc), bulk actions, sharing.

## Acceptance criteria
- Newly created template appears at the top by `lastUsedAt`.
- Case count column matches the number of `ViolationCase` rows for that template.
- Search by partial name and by full order number both work.
- Empty state shows when the user has no templates.
