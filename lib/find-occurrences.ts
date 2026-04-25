import type { Editor } from "@tiptap/react";

export interface Occurrence {
  from: number;
  to: number;
  text: string;
  contextSnippet: string;
}

const SNIPPET_RADIUS = 25;

// Walk text nodes in the editor and find every case-sensitive exact match of `target`
// that is NOT already inside a variableSpan mark.
export function findOccurrences(editor: Editor, target: string): Occurrence[] {
  if (!editor || !target) return [];
  const markType = editor.schema.marks.variableSpan;
  const results: Occurrence[] = [];
  const fullText = editor.state.doc.textBetween(0, editor.state.doc.content.size, "\n", " ");

  editor.state.doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;
    const text = node.text;
    let idx = 0;
    while (true) {
      const found = text.indexOf(target, idx);
      if (found < 0) break;
      const from = pos + found;
      const to = from + target.length;
      // Skip if this text node is already inside a variableSpan mark
      const hasVar = node.marks.some((m) => m.type === markType);
      if (!hasVar) {
        const start = Math.max(0, from - SNIPPET_RADIUS);
        const end = Math.min(fullText.length, to + SNIPPET_RADIUS);
        const snippet = fullText.slice(start, end).replace(/\s+/g, " ");
        results.push({ from, to, text: target, contextSnippet: snippet });
      }
      idx = found + target.length;
    }
  });

  return results;
}
