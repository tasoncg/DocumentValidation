# 10 — Variable name suggestions

Refs: appspec §8.

## Goal
When the user opens the variable modal, the **Variable name** field is pre-filled with a sensible snake_case suggestion based on the selected text.

## Scope
- Heuristic detector in `lib/variable-suggest.ts` returning a name for selected text. Rules:
  - Vietnamese person name pattern (2–5 capitalized tokens) → `ho_ten_nguoi_vi_pham`.
  - 4-digit year (1900–2099) → `nam_sinh`.
  - Date patterns (`dd/mm/yyyy`, `dd-mm-yyyy`, `ngày … tháng … năm …`) → `ngay_vi_pham` (fallback `ngay_lap_bien_ban`).
  - Address pattern (contains `số`, `đường`, `phường`, `quận`, `xã`, `huyện`, `tỉnh`, `thành phố`) → `dia_chi`.
  - Vehicle plate (e.g. `\d{2}[A-Z]-\d{4,5}`) → `bien_so_xe`.
  - National ID (9 or 12 digits) → `so_cccd`.
  - Phrases starting with `Hành vi`, `Lỗi`, `Vi phạm` → `hanh_vi_vi_pham`.
  - Otherwise: lowercase + strip diacritics + non-alphanum → `_`, collapse repeats, trim.
- If the suggested name already exists on the template, append `_2`, `_3`, … until unique.
- The user can always overwrite the suggestion; their value wins on save.

## Out of scope
- ML-based detection, language detection beyond Vietnamese, learned suggestions.

## Acceptance criteria
- Each example in appspec §8 produces the expected suggestion.
- Free-form text falls through to a clean snake_case slug.
- Collisions are auto-suffixed; no save-time uniqueness errors from the suggester.
