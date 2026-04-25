// Suggest a snake_case variable name from selected Vietnamese text.
// Order matters: more specific patterns first.

const PLATE_RE = /^\d{2}[A-Z]-?\d{4,5}$/;
const ID_RE = /^(\d{9}|\d{12})$/;
const YEAR_RE = /^(19|20)\d{2}$/;
const DATE_NUMERIC_RE = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/;
const DATE_VI_RE = /ngày.*tháng.*năm/i;
const ADDRESS_KEYWORDS = ["số ", "đường", "phường", "quận", "xã", "huyện", "tỉnh", "thành phố"];
const VIOLATION_PREFIXES = ["hành vi", "lỗi ", "vi phạm"];

export function suggestVariableName(text: string, existing: string[] = []): string {
  const trimmed = text.trim();
  const base = detect(trimmed) ?? toSnakeCase(trimmed);
  return ensureUnique(base, new Set(existing));
}

function detect(text: string): string | null {
  if (!text) return null;
  const compact = text.replace(/\s+/g, " ");
  const lower = compact.toLowerCase();

  if (PLATE_RE.test(compact.replace(/\s+/g, ""))) return "bien_so_xe";
  if (ID_RE.test(compact.replace(/\s+/g, ""))) return "so_cccd";
  if (YEAR_RE.test(compact)) return "nam_sinh";
  if (DATE_NUMERIC_RE.test(compact) || DATE_VI_RE.test(lower)) return "ngay_vi_pham";
  // Address requires at least two distinct keywords to avoid false positives
  // on phrases like "Số biên bản".
  const addressHits = ADDRESS_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  if (addressHits >= 2) return "dia_chi";
  if (VIOLATION_PREFIXES.some((p) => lower.startsWith(p))) return "hanh_vi_vi_pham";
  if (isPersonName(compact)) return "ho_ten_nguoi_vi_pham";

  return null;
}

function isPersonName(text: string): boolean {
  const tokens = text.split(/\s+/).filter(Boolean);
  if (tokens.length < 2 || tokens.length > 5) return false;
  return tokens.every((tok) =>
    /^[A-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ][a-zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]*$/u.test(tok)
  );
}

export function toSnakeCase(text: string): string {
  if (!text) return "var";
  // Map đ/Đ before NFD strip (they don't decompose).
  const replaced = text.replace(/[đĐ]/g, "d");
  const noDiacritics = replaced.normalize("NFD").replace(/[̀-ͯ]/g, "");
  const slug = noDiacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!slug) return "var";
  // Ensure starts with a letter (placeholder/identifier hygiene).
  if (/^[0-9]/.test(slug)) return "v_" + slug;
  return slug;
}

function ensureUnique(base: string, existing: Set<string>): string {
  if (!existing.has(base)) return base;
  let n = 2;
  while (existing.has(`${base}_${n}`)) n++;
  return `${base}_${n}`;
}
