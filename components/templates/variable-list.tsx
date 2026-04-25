"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { deleteVariableAction } from "@/app/(app)/templates/variables/actions";
import type { RichEditorHandle } from "@/components/editor/rich-editor";

export interface VariableRow {
  id: string;
  name: string;
  appearanceCount: number;
  originalText: string;
}

interface Props {
  templateId: string;
  variables: VariableRow[];
  editorRef: React.RefObject<RichEditorHandle>;
  onChanged: () => void;
}

export function VariableList({ templateId, variables, editorRef, onChanged }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  function activate(id: string) {
    if (activeId === id) return;
    setActiveId(id);
    const c = editorRef.current?.highlightVar(id) ?? 0;
    setCount(c);
    setIndex(0);
    if (c > 0) editorRef.current?.scrollToVarOccurrence(id, 0);
  }

  function next() {
    if (!activeId || count === 0) return;
    const i = (index + 1) % count;
    setIndex(i);
    editorRef.current?.scrollToVarOccurrence(activeId, i);
  }

  function prev() {
    if (!activeId || count === 0) return;
    const i = (index - 1 + count) % count;
    setIndex(i);
    editorRef.current?.scrollToVarOccurrence(activeId, i);
  }

  async function onDelete(v: VariableRow) {
    if (!confirm(`Xoá variable "${v.name}"?`)) return;
    try {
      editorRef.current?.removeVariableMarkByVarId(v.id);
      await deleteVariableAction(v.id, templateId);
      toast({ title: "Đã xoá variable", description: v.name });
      if (activeId === v.id) setActiveId(null);
      onChanged();
      router.refresh();
    } catch (err) {
      toast({ title: "Lỗi", description: String(err), variant: "destructive" });
    }
  }

  if (variables.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Chưa có variable. Chọn text trong văn bản và bấm &ldquo;Cài đặt nội dung đã chọn&rdquo;.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {variables.map((v) => {
        const isActive = activeId === v.id;
        return (
          <div
            key={v.id}
            className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${isActive ? "bg-accent" : ""}`}
          >
            <button type="button" className="flex-1 text-left" onClick={() => activate(v.id)}>
              <div className="font-medium">{v.name}</div>
              <div className="text-xs text-muted-foreground">
                {v.appearanceCount} vị trí · &ldquo;{v.originalText}&rdquo;
              </div>
            </button>
            {isActive && count > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Button size="icon" variant="ghost" onClick={prev} title="Trước">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="tabular-nums">
                  {index + 1}/{count}
                </span>
                <Button size="icon" variant="ghost" onClick={next} title="Sau">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            <Button size="icon" variant="ghost" onClick={() => onDelete(v)} title="Xoá variable">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
