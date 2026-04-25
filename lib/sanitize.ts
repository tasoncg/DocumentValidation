import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "em",
  "u",
  "s",
  "br",
  "ul",
  "ol",
  "li",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "span",
  "div",
  "blockquote"
];

const ALLOWED_STYLE_RE = /^(text-align|font-weight|font-style|text-decoration):/;

export function sanitize(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      "*": ["class", "style"],
      span: ["class", "style", "data-var-id", "data-placeholder-key", "data-original-value"],
      td: ["colspan", "rowspan", "class", "style"],
      th: ["colspan", "rowspan", "class", "style"]
    },
    allowedStyles: {
      "*": {
        "text-align": [/^(left|right|center|justify)$/],
        "font-weight": [/^(bold|[1-9]00)$/],
        "font-style": [/^(italic|normal)$/],
        "text-decoration": [/^(underline|line-through|none)$/]
      }
    },
    transformTags: {
      "*": (tagName, attribs) => {
        // Drop any style props that aren't whitelisted via the regex
        if (attribs.style) {
          const decls = attribs.style
            .split(";")
            .map((d) => d.trim())
            .filter(Boolean)
            .filter((d) => ALLOWED_STYLE_RE.test(d));
          if (decls.length === 0) delete attribs.style;
          else attribs.style = decls.join("; ");
        }
        return { tagName, attribs };
      }
    }
  });
}
