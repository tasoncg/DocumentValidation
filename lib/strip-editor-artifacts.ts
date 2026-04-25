// Server-safe HTML cleaner. Strips classes/attributes that are only meaningful
// inside the editor (highlights, paragraph markers, ProseMirror internals).
// Uses string-level regex instead of DOMParser so it can run in RSC.

const EDITOR_ONLY_CLASSES = ["var-highlight", "var-highlight-active", "var-empty", "ProseMirror-selectednode"];

export function stripEditorArtifacts(html: string): string {
  let out = html;

  // Remove editor-only classes from class="..." attributes
  out = out.replace(/class="([^"]*)"/g, (_, cls: string) => {
    const filtered = cls
      .split(/\s+/)
      .filter((c) => c && !EDITOR_ONLY_CLASSES.includes(c))
      .join(" ");
    return filtered ? `class="${filtered}"` : "";
  });

  // Remove ProseMirror data attributes
  out = out.replace(/\s+data-pm-[\w-]+="[^"]*"/g, "");

  return out;
}
