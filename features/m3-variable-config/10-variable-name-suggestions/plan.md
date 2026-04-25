# Plan: 10 — Variable name suggestions

## Dependencies
- None (pure utility); consumed by 09.

## Files to add
- `lib/variable-suggest.ts`
- `lib/__tests__/variable-suggest.test.ts` — vitest cases

## Implementation steps
1. `lib/variable-suggest.ts`:
   ```ts
   export function suggestVariableName(text: string, existing: string[]): string {
     const trimmed = text.trim();
     const base = detectName(trimmed) ?? toSnakeCase(trimmed);
     return ensureUnique(base, new Set(existing));
   }
   ```
2. Detectors (run in this order — first match wins):
   - **Vehicle plate**: `/^\d{2}[A-Z]-?\d{4,5}$/` → `bien_so_xe`.
   - **National ID**: `/^\d{9}$|^\d{12}$/` → `so_cccd`.
   - **Year only**: `/^(19|20)\d{2}$/` → `nam_sinh`.
   - **Date**: `/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/` or contains `ngày` + `tháng` + `năm` → `ngay_vi_pham`.
   - **Address**: lowercased text contains any of `số `, `đường`, `phường`, `quận`, `xã`, `huyện`, `tỉnh`, `thành phố` → `dia_chi`.
   - **Person name**: 2–5 tokens, every token starts with capital (Unicode-aware, allow Vietnamese diacritics) → `ho_ten_nguoi_vi_pham`.
   - **Violation phrase**: starts with `Hành vi`, `Lỗi`, `Vi phạm` (case-insensitive) → `hanh_vi_vi_pham`.
3. `toSnakeCase(text)`:
   - Normalize: `text.normalize('NFD').replace(/[̀-ͯ]/g, '')` (strip diacritics).
   - Special: replace `đ`/`Đ` before normalize, since they don't decompose.
   - Lowercase, replace non-`[a-z0-9]` → `_`, collapse repeats, trim leading/trailing `_`.
4. `ensureUnique(base, existing)`: if not in set return base; else try `base_2`, `base_3`, … until unique.
5. Test cases (vitest):
   - Each example from appspec §8.
   - Free-form text with diacritics → clean snake_case.
   - Collision: existing `['ho_ten_nguoi_vi_pham']` + name → `ho_ten_nguoi_vi_pham_2`.

## Verification
- `npm run test -- variable-suggest` passes all cases.
- In feature 09 modal, opening with a person-name selection pre-fills `ho_ten_nguoi_vi_pham`.
- Free-form selection produces a slug-style snake_case name.
- Suggested name never duplicates an existing variable name.

## Notes
- Heuristics only; user always wins on edit.
- Order matters: plate before year (a 4-digit value isn't a plate).
