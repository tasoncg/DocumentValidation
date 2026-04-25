"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RichEditorHandle } from "@/components/editor/rich-editor";

interface VariableRow {
  id: string;
  name: string;
  originalText: string;
  appearanceCount: number;
}

interface Props {
  variables: VariableRow[];
  values: Record<string, string>;
  onChange: (varId: string, value: string) => void;
  editorRef: React.RefObject<RichEditorHandle>;
}

export function CaseVariablePanel({ variables, values, onChange, editorRef }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);

  function focusVar(id: string) {
    setActiveId(id);
    const c = editorRef.current?.highlightVar(id) ?? 0;
    setCount(c);
    setIndex(0);
    if (c > 0) editorRef.current?.scrollToVarOccurrence(id, 0);
  }

  function nav(delta: number) {
    if (!activeId || count === 0) return;
    const next = (index + delta + count) % count;
    setIndex(next);
    editorRef.current?.scrollToVarOccurrence(activeId, next);
  }

  if (variables.length === 0) {
    return <p className="text-sm text-muted-foreground">Template này chưa có variable nào.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
      {variables.map((v) => {
        const value = values[v.id] ?? "";
        const isEmpty = !value.trim();
        const isActive = activeId === v.id;
        return (
          <div
            key={v.id}
            className={`rounded-md border bg-background p-2 ${isActive ? "ring-2 ring-primary" : ""}`}
          >
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                className="flex items-center gap-1 font-medium"
                onClick={() => focusVar(v.id)}
                title={v.originalText}
              >
                {isEmpty && <AlertCircle className="h-3 w-3 text-destructive" />}
                <span>{v.name}</span>
                <span className="text-muted-foreground">({v.appearanceCount})</span>
              </button>
              {isActive && count > 0 && (
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => nav(-1)}>
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <span className="tabular-nums text-[10px]">
                    {index + 1}/{count}
                  </span>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => nav(1)}>
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <Input
              className="mt-1 h-8"
              value={value}
              placeholder={v.originalText}
              onChange={(e) => onChange(v.id, e.target.value)}
              onFocus={() => focusVar(v.id)}
            />
          </div>
        );
      })}
    </div>
  );
}
