# 06 — Template create & edit pages

Refs: appspec §6.3, §9.

## Goal
A shared page that handles both creating a new template and editing an existing one, with a frozen top panel and a scrollable document area.

## Scope
- Routes:
  - `/templates/new` — starts empty; first action is upload.
  - `/templates/[id]/edit` — loads existing `contentHtml` and variables.
- Layout:
  - **Top frozen panel** (sticky): order number, template name (editable input), button **“Cài đặt nội dung đã chọn”** (wired in feature 09), button **“Lưu config”**, list of configured variables.
  - **Document area** (scrollable): editor (feature 08) with paragraph markers visible only on screen.
- Save action persists `name`, `contentHtml`, and variables (delegated to feature 09 for variable persistence).
- “Lưu config” disabled while name is empty or while a save is in flight.
- Unsaved-changes guard on navigate-away.

## Out of scope
- Versioning, drafts, autosave (manual save only for MVP).

## Acceptance criteria
- After upload (feature 05), HTML appears in the editor.
- Renaming and saving persists; revisiting `/templates/[id]/edit` shows the new name.
- Top panel stays fixed while the document scrolls.
- Variables saved earlier are listed in the top panel on edit.
