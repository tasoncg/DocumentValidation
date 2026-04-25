import mammoth from "mammoth";
import { sanitize } from "@/lib/sanitize";

const STYLE_MAP = [
  "p[style-name='Heading 1'] => h1",
  "p[style-name='Heading 2'] => h2",
  "p[style-name='Heading 3'] => h3",
  "u => u",
  "b => strong",
  "i => em"
];

export async function parseDocx(buffer: Buffer, originalFileName: string) {
  const { value } = await mammoth.convertToHtml({ buffer }, { styleMap: STYLE_MAP });
  return { html: sanitize(value), originalFileName };
}
