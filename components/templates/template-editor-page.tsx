"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { RichEditor, type RichEditorHandle } from "@/components/editor/rich-editor";
import { EditorToolbar } from "@/components/editor/toolbar";
import { UploadButton } from "@/components/templates/upload-button";
import { VariableList, type VariableRow } from "@/components/templates/variable-list";
import { VariableModal } from "@/components/templates/variable-modal";
import { createTemplateAction, updateTemplateAction } from "@/app/(app)/templates/actions";

type Mode = "new" | "edit";

interface InitialTemplate {
  id: string;
  orderNumber: number;
  name: string;
  contentHtml: string;
  variables: VariableRow[];
}

interface Props {
  mode: Mode;
  initial?: InitialTemplate;
}

export function TemplateEditorPage({ mode, initial }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const editorRef = useRef<RichEditorHandle>(null);

  const [templateId, setTemplateId] = useState<string | null>(initial?.id ?? null);
  const [orderNumber, setOrderNumber] = useState<number | null>(initial?.orderNumber ?? null);
  const [name, setName] = useState(initial?.name ?? "");
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);
  const [html, setHtml] = useState(initial?.contentHtml ?? "");
  const [hasUpload, setHasUpload] = useState(Boolean(initial?.contentHtml));
  const [variables, setVariables] = useState<VariableRow[]>(initial?.variables ?? []);
  const [dirty, setDirty] = useState(false);
  const [, startSave] = useTransition();
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<
    { text: string; from: number; to: number } | null
  >(null);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function onParsed(parsed: { html: string; originalFileName: string }) {
    setHtml(parsed.html);
    setOriginalFileName(parsed.originalFileName);
    if (!name) setName(parsed.originalFileName.replace(/\.docx$/i, ""));
    setHasUpload(true);
    setDirty(true);
    setTimeout(() => editorRef.current?.setHTML(parsed.html), 0);
  }

  function openVariableModal() {
    const text = editorRef.current?.getSelectionText() ?? "";
    const range = editorRef.current?.getSelectionRange();
    if (!text || !range) {
      toast({ title: "Chưa chọn text", description: "Hãy bôi đen đoạn text trong văn bản trước.", variant: "destructive" });
      return;
    }
    if (!templateId) {
      toast({
        title: "Cần lưu trước",
        description: "Hãy lưu template trước khi cấu hình variable.",
        variant: "destructive"
      });
      return;
    }
    setPendingSelection({ text, from: range.from, to: range.to });
    setModalOpen(true);
  }

  async function onSave() {
    if (!name.trim()) {
      toast({ title: "Tên trống", description: "Nhập tên văn bản trước khi lưu.", variant: "destructive" });
      return;
    }
    if (!hasUpload) {
      toast({ title: "Chưa có nội dung", description: "Hãy upload file .docx.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const currentHtml = editorRef.current?.getHTML() ?? html;
    try {
      if (mode === "new" || !templateId) {
        const t = await createTemplateAction({
          name: name.trim(),
          contentHtml: currentHtml,
          originalFileName: originalFileName ?? "uploaded.docx"
        });
        setTemplateId(t.id);
        setOrderNumber(t.orderNumber);
        setDirty(false);
        toast({ title: "Đã tạo template", description: name });
        router.replace(`/templates/${t.id}/edit`);
      } else {
        await updateTemplateAction(templateId, { name: name.trim(), contentHtml: currentHtml });
        setDirty(false);
        toast({ title: "Đã lưu", description: name });
        router.refresh();
      }
    } catch (err) {
      toast({ title: "Lưu thất bại", description: String(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="top-panel sticky top-14 z-20 -mx-4 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="container mx-auto space-y-3">
          <div className="flex items-end gap-3">
            <div className="w-24 shrink-0">
              <Label className="text-xs">STT</Label>
              <div className="mt-1 flex h-10 items-center rounded-md border bg-muted px-3 text-sm">
                {orderNumber ?? "—"}
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="tplName" className="text-xs">
                Tên văn bản
              </Label>
              <Input
                id="tplName"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setDirty(true);
                }}
                placeholder="Biên bản vi phạm hành chính ..."
              />
            </div>
            <Button type="button" onClick={openVariableModal} variant="outline">
              <FileEdit className="mr-2 h-4 w-4" />
              Cài đặt nội dung đã chọn
            </Button>
            <Button type="button" onClick={onSave} disabled={saving || !name.trim() || !hasUpload}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Đang lưu..." : "Lưu config"}
            </Button>
          </div>

          <div>
            <Label className="text-xs">Variables ({variables.length})</Label>
            <div className="mt-1">
              <VariableList
                templateId={templateId ?? ""}
                variables={variables}
                editorRef={editorRef}
                onChanged={() => router.refresh()}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="ml-12">
        {!hasUpload ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-16 text-center">
            <h2 className="text-lg font-semibold">Upload file Word</h2>
            <p className="mt-1 text-sm text-muted-foreground">Chọn file .docx để bắt đầu cấu hình.</p>
            <div className="mt-4">
              <UploadButton onParsed={onParsed} />
            </div>
          </div>
        ) : (
          <RichEditor
            ref={editorRef}
            initialHtml={html}
            editable
            onChange={() => setDirty(true)}
            toolbar={(editor) => <EditorToolbar editor={editor} />}
          />
        )}
      </div>

      <VariableModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editorRef={editorRef}
        templateId={templateId}
        selection={pendingSelection}
        existingVariables={variables.map((v) => ({ id: v.id, name: v.name }))}
        onSaved={() => {
          // Force a server refresh; parent server component will refeed `variables` via router.refresh.
          router.refresh();
        }}
      />
    </div>
  );
}
