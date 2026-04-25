import { sanitize } from "@/lib/sanitize";
import { stripEditorArtifacts } from "@/lib/strip-editor-artifacts";

interface Props {
  html: string;
  className?: string;
}

export function PrintableDocument({ html, className }: Props) {
  const cleaned = sanitize(stripEditorArtifacts(html));
  return (
    <article
      className={`printable a4 ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: cleaned }}
    />
  );
}
