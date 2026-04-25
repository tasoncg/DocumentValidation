"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: Props) {
  if (!editor) return <div className="editor-toolbar h-10" />;

  const btn = (active: boolean) =>
    cn(
      "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors",
      active ? "bg-primary text-primary-foreground" : "hover:bg-accent"
    );

  return (
    <div className="editor-toolbar">
      <button
        type="button"
        title="Đậm (Ctrl+B)"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive("bold"))}
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Nghiêng (Ctrl+I)"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive("italic"))}
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Gạch chân (Ctrl+U)"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btn(editor.isActive("underline"))}
      >
        <UnderlineIcon className="h-4 w-4" />
      </button>
      <span className="mx-1 h-6 w-px bg-border" />
      <button
        type="button"
        title="Bullet list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive("bulletList"))}
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Numbered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btn(editor.isActive("orderedList"))}
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <span className="mx-1 h-6 w-px bg-border" />
      <button
        type="button"
        title="Căn trái"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={btn(editor.isActive({ textAlign: "left" }))}
      >
        <AlignLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Căn giữa"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={btn(editor.isActive({ textAlign: "center" }))}
      >
        <AlignCenter className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Căn phải"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={btn(editor.isActive({ textAlign: "right" }))}
      >
        <AlignRight className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Căn đều"
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        className={btn(editor.isActive({ textAlign: "justify" }))}
      >
        <AlignJustify className="h-4 w-4" />
      </button>
    </div>
  );
}
