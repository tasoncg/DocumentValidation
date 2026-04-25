"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { suggestVariableName } from "@/lib/variable-suggest";
import { newPlaceholderKey } from "@/lib/placeholder-key";
import { findOccurrences, type Occurrence } from "@/lib/find-occurrences";
import { createVariableAction } from "@/app/(app)/templates/variables/actions";
import type { RichEditorHandle } from "@/components/editor/rich-editor";

type ApplyMode = "all" | "only" | "manual";

interface ExistingVariable {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  editorRef: React.RefObject<RichEditorHandle>;
  templateId: string | null;
  selection: { text: string; from: number; to: number } | null;
  existingVariables: ExistingVariable[];
  onSaved: () => void;
}

const NAME_RE = /^[a-z][a-z0-9_]*$/;

export function VariableModal({
  open,
  onClose,
  editorRef,
  templateId,
  selection,
  existingVariables,
  onSaved
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [applyMode, setApplyMode] = useState<ApplyMode>("all");
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [included, setIncluded] = useState<boolean[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !selection || !editorRef.current) return;
    const editor = editorRef.current.getEditor();
    if (!editor) return;
    const occ = findOccurrences(editor, selection.text);
    setOccurrences(occ);
    setIncluded(occ.map(() => true));
    setApplyMode("all");
    const existingNames = existingVariables.map((v) => v.name);
    setName(suggestVariableName(selection.text, existingNames));
  }, [open, selection, editorRef, existingVariables]);

  const includedRanges = useMemo(() => {
    if (applyMode === "all") return occurrences;
    if (applyMode === "only" && selection) {
      return occurrences.filter((o) => o.from === selection.from && o.to === selection.to);
    }
    return occurrences.filter((_, i) => included[i]);
  }, [applyMode, occurrences, included, selection]);

  function toggleIncluded(i: number) {
    setIncluded((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  function nameError() {
    if (!name) return "Tên không được trống.";
    if (!NAME_RE.test(name)) return "Phải là snake_case (chữ thường, số, _).";
    if (existingVariables.some((v) => v.name === name)) return "Tên đã tồn tại trong văn bản này.";
    return null;
  }

  async function onSubmit() {
    if (!templateId || !selection) return;
    const err = nameError();
    if (err) {
      toast({ title: "Tên không hợp lệ", description: err, variant: "destructive" });
      return;
    }
    if (includedRanges.length === 0) {
      toast({ title: "Chưa chọn vị trí", description: "Cần chọn ít nhất 1 vị trí.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const placeholderKey = newPlaceholderKey();
      const result = await createVariableAction({
        templateId,
        name,
        originalText: selection.text,
        placeholderKey,
        appearanceCount: includedRanges.length
      });
      // Apply marks in editor
      editorRef.current?.applyVariableMark(
        { varId: result.id, placeholderKey, originalValue: selection.text },
        includedRanges.map((r) => ({ from: r.from, to: r.to }))
      );
      toast({ title: "Đã lưu variable", description: name });
      onSaved();
      onClose();
      router.refresh();
    } catch (err) {
      toast({ title: "Lưu thất bại", description: String(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cài đặt nội dung đã chọn</DialogTitle>
          <DialogDescription>
            Tạo variable từ đoạn text đã chọn, áp dụng cho các vị trí giống nhau trong văn bản.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="varName">Tên variable</Label>
            <Input id="varName" value={name} onChange={(e) => setName(e.target.value)} placeholder="ho_ten_nguoi_vi_pham" />
            {nameError() && <p className="text-xs text-destructive">{nameError()}</p>}
          </div>

          <div className="space-y-2">
            <Label>Text đã chọn</Label>
            <div className="rounded-md border bg-muted px-3 py-2 text-sm">{selection?.text ?? "—"}</div>
          </div>

          <div className="space-y-2">
            <Label>Phạm vi áp dụng</Label>
            <RadioGroup value={applyMode} onValueChange={(v) => setApplyMode(v as ApplyMode)}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id="mode-all" />
                <Label htmlFor="mode-all" className="font-normal">
                  Tất cả lần xuất hiện ({occurrences.length})
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="only" id="mode-only" />
                <Label htmlFor="mode-only" className="font-normal">
                  Chỉ vị trí đang chọn
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="manual" id="mode-manual" />
                <Label htmlFor="mode-manual" className="font-normal">
                  Chọn thủ công
                </Label>
              </div>
            </RadioGroup>
          </div>

          {applyMode === "manual" && (
            <div className="space-y-1 rounded-md border p-3 max-h-48 overflow-auto">
              {occurrences.map((o, i) => (
                <label key={i} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={included[i] ?? false}
                    onChange={() => toggleIncluded(i)}
                    className="mt-1"
                  />
                  <span className="text-muted-foreground">…{o.contextSnippet}…</span>
                </label>
              ))}
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Sẽ áp dụng cho <strong>{includedRanges.length}</strong> vị trí.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Huỷ
          </Button>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? "Đang lưu..." : "Lưu variable"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
