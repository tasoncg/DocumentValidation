# 07 — Template delete

Refs: appspec §6.2 actions.

## Goal
Officer can delete a template they own, with a clear confirmation step and cascade behavior the user understands.

## Scope
- Delete action on each row in `/templates`.
- Confirmation dialog naming the template and the count of cases that will be removed.
- Server action checks ownership (`createdById === session.user.id`) before deleting.
- Cascade removes `DocumentVariable`, `ViolationCase`, `ViolationCaseValue` for that template.
- Toast on success/failure; row disappears from the grid on success.

## Out of scope
- Undo / trash bin.
- Soft delete (we do hard delete in MVP; revisit if cases need to outlive templates).

## Acceptance criteria
- Deleting a template with cases warns about the case count first.
- A non-owner cannot delete (server rejects with 403/redirect).
- Grid updates without a full page reload.
