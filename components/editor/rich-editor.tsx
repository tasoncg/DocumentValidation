"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { VariableSpan, type VariableSpanAttrs } from "@/components/editor/extensions/variable-span";
import { sanitize } from "@/lib/sanitize";

export interface RichEditorHandle {
  getHTML: () => string;
  setHTML: (html: string) => void;
  getSelectionText: () => string;
  getSelectionRange: () => { from: number; to: number } | null;
  applyVariableMark: (attrs: VariableSpanAttrs, ranges: { from: number; to: number }[]) => void;
  removeVariableMarkByVarId: (varId: string) => void;
  highlightVar: (varId: string) => number;
  clearHighlight: () => void;
  scrollToVarOccurrence: (varId: string, index: number) => void;
  replaceVarText: (varId: string, value: string) => void;
  markEmptyVars: (emptyVarIds: string[]) => void;
  getEditor: () => Editor | null;
  focus: () => void;
}

interface Props {
  initialHtml?: string;
  editable?: boolean;
  onChange?: (html: string) => void;
  toolbar?: (editor: Editor | null) => React.ReactNode;
}

export const RichEditor = forwardRef<RichEditorHandle, Props>(function RichEditor(
  { initialHtml = "", editable = true, onChange, toolbar },
  ref
) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      VariableSpan
    ],
    []
  );

  const editor = useEditor({
    extensions,
    content: initialHtml,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML())
  });

  useEffect(() => {
    if (!editor) return;
    if (initialHtml && editor.isEmpty) editor.commands.setContent(initialHtml, false);
  }, [editor, initialHtml]);

  useImperativeHandle(
    ref,
    (): RichEditorHandle => ({
      getHTML: () => (editor ? sanitize(editor.getHTML()) : ""),
      setHTML: (html) => editor?.commands.setContent(html, false),
      getSelectionText: () => {
        if (!editor) return "";
        const { from, to } = editor.state.selection;
        return editor.state.doc.textBetween(from, to, " ").trim();
      },
      getSelectionRange: () => {
        if (!editor) return null;
        const { from, to, empty } = editor.state.selection;
        if (empty) return null;
        return { from, to };
      },
      applyVariableMark: (attrs, ranges) => {
        if (!editor || ranges.length === 0) return;
        editor
          .chain()
          .command(({ tr, dispatch }) => {
            // apply marks in descending order so positions stay valid
            const sorted = [...ranges].sort((a, b) => b.from - a.from);
            const markType = editor.schema.marks.variableSpan;
            for (const r of sorted) {
              tr.addMark(r.from, r.to, markType.create(attrs));
            }
            if (dispatch) dispatch(tr);
            return true;
          })
          .run();
      },
      removeVariableMarkByVarId: (varId) => {
        if (!editor) return;
        const markType = editor.schema.marks.variableSpan;
        const ranges: { from: number; to: number }[] = [];
        editor.state.doc.descendants((node, pos) => {
          if (!node.isText) return;
          const m = node.marks.find((mk) => mk.type === markType && mk.attrs.varId === varId);
          if (m) ranges.push({ from: pos, to: pos + node.nodeSize });
        });
        if (ranges.length === 0) return;
        editor
          .chain()
          .command(({ tr, dispatch }) => {
            for (const r of ranges.sort((a, b) => b.from - a.from)) {
              tr.removeMark(r.from, r.to, markType);
            }
            if (dispatch) dispatch(tr);
            return true;
          })
          .run();
      },
      highlightVar: (varId) => {
        const root = editor?.view.dom;
        if (!root) return 0;
        clearHighlightDom(root);
        const els = root.querySelectorAll<HTMLElement>(`[data-var-id="${cssEscape(varId)}"]`);
        els.forEach((el) => el.classList.add("var-highlight"));
        return els.length;
      },
      clearHighlight: () => {
        const root = editor?.view.dom;
        if (root) clearHighlightDom(root);
      },
      scrollToVarOccurrence: (varId, index) => {
        const root = editor?.view.dom;
        if (!root) return;
        const els = root.querySelectorAll<HTMLElement>(`[data-var-id="${cssEscape(varId)}"]`);
        els.forEach((el) => el.classList.remove("var-highlight-active"));
        const target = els[index];
        if (!target) return;
        target.classList.add("var-highlight-active");
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      },
      replaceVarText: (varId, value) => {
        if (!editor) return;
        const markType = editor.schema.marks.variableSpan;
        editor
          .chain()
          .command(({ tr, dispatch }) => {
            const updates: { from: number; to: number; text: string; marks: ReturnType<typeof markType.create>[] }[] = [];
            editor.state.doc.descendants((node, pos) => {
              if (!node.isText) return;
              const m = node.marks.find((mk) => mk.type === markType && mk.attrs.varId === varId);
              if (!m) return;
              const newText = value.length === 0 ? (m.attrs.originalValue ?? node.text ?? "") : value;
              if (node.text === newText) return;
              updates.push({ from: pos, to: pos + node.nodeSize, text: newText, marks: Array.from(node.marks) });
            });
            if (updates.length === 0) return false;
            for (const u of updates.sort((a, b) => b.from - a.from)) {
              tr.replaceWith(u.from, u.to, editor.schema.text(u.text, u.marks));
            }
            if (dispatch) dispatch(tr);
            return true;
          })
          .run();
      },
      markEmptyVars: (emptyVarIds) => {
        const root = editor?.view.dom;
        if (!root) return;
        root.querySelectorAll<HTMLElement>("[data-var-id]").forEach((el) => {
          const id = el.getAttribute("data-var-id");
          if (id && emptyVarIds.includes(id)) el.classList.add("var-empty");
          else el.classList.remove("var-empty");
        });
      },
      getEditor: () => editor,
      focus: () => editor?.commands.focus()
    }),
    [editor]
  );

  return (
    <div className="rounded-lg border-0">
      {toolbar?.(editor)}
      <div className="editor-shell">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

function clearHighlightDom(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>(".var-highlight, .var-highlight-active")
    .forEach((el) => el.classList.remove("var-highlight", "var-highlight-active"));
}

function cssEscape(value: string) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value);
  return value.replace(/["\\]/g, "\\$&");
}
