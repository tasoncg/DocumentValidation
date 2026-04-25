"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { RichEditor, type RichEditorHandle } from "@/components/editor/rich-editor";
import { EditorToolbar } from "@/components/editor/toolbar";
import { CaseVariablePanel } from "@/components/cases/case-variable-panel";
import { MissingVarsDialog } from "@/components/cases/missing-vars-dialog";
import { createCaseAction, updateCaseAction } from "@/app/(app)/cases/actions";

type Mode = "new" | "edit";

interface VariableRow {
  id: string;
  name: string;
  originalText: string;
  appearanceCount: number;
}

interface InitialCase {
  id?: string;
  caseNumber: string | null;
  finalContentHtml: string;
  templateId: string;
  templateName: string;
  variables: VariableRow[];
  values: Record<string, string>;
}

interface Props {
  mode: Mode;
  initial: InitialCase;
}

export function CaseEditorPage({ mode, initial }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const editorRef = useRef<RichEditorHandle>(null);

  const [caseId, setCaseId] = useState<string | null>(initial.id ?? null);
  const [caseNumber, setCaseNumber] = useState(initial.caseNumber ?? "");
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const variable of initial.variables) v[variable.id] = initial.values[variable.id] ?? "";
    return v;
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [missingOpen, setMissingOpen] = useState(false);
  const [pendingNav, setPendingNav] = useState<"preview" | "print" | null>(null);

  // Initial replacement: apply any persisted values to the editor on mount.
  useEffect(() => {
    const t = setTimeout(() => {
      for (const v of initial.variables) {
        const value = values[v.id];
        if (value) editorRef.current?.replaceVarText(v.id, value);
      }
    }, 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const missingVars = useMemo(() => initial.variables.filter((v) => !values[v.id]?.trim()), [initial.variables, values]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function onValueChange(varId: string, value: string) {
    setValues((p) => ({ ...p, [varId]: value }));
    editorRef.current?.replaceVarText(varId, value);
    setDirty(true);
  }

  async function persist(): Promise<string | null> {
    setSaving(true);
    const finalHtml = editorRef.current?.getHTML() ?? initial.finalContentHtml;
    const valuesArr = Object.entries(values).map(([variableId, value]) => ({ variableId, value }));
    try {
      if (mode === "new" || !caseId) {
        const c = await createCaseAction({
          templateId: initial.templateId,
          finalContentHtml: finalHtml,
          caseNumber: caseNumber || null,
          values: valuesArr
        });
        setCaseId(c.id);
        setDirty(false);
        toast({ title: "Đã tạo biên bản" });
        router.replace(`/cases/${c.id}`);
        return c.id;
      } else {
        await updateCaseAction({
          id: caseId,
          finalContentHtml: finalHtml,
          caseNumber: caseNumber || null,
          values: valuesArr
        });
        setDirty(false);
        toast({ title: "Đã lưu" });
        router.refresh();
        return caseId;
      }
    } catch (err) {
      toast({ title: "Lưu thất bại", description: String(err), variant: "destructive" });
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function onSaveClick() {
    await persist();
  }

  async function attemptNav(target: "preview" | "print") {
    if (missingVars.length > 0) {
      setPendingNav(target);
      setMissingOpen(true);
      return;
    }
    const id = await persist();
    if (!id) return;
    if (target === "preview") router.push(`/cases/${id}/preview`);
    else router.push(`/cases/${id}/preview-print`);
  }

  async function onContinueAnyway() {
    setMissingOpen(false);
    const target = pendingNav;
    setPendingNav(null);
    if (!target) return;
    const id = await persist();
    if (!id) return;
    if (target === "preview") router.push(`/cases/${id}/preview?allow_missing=1`);
    else router.push(`/cases/${id}/preview-print?allow_missing=1`);
  }

  return (
    <div className="space-y-4">
      <div className="top-panel sticky top-14 z-20 -mx-4 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="container mx-auto space-y-3">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Label className="text-xs">Văn bản mẫu</Label>
              <div className="mt-1 flex h-10 items-center rounded-md border bg-muted px-3 text-sm font-medium">
                {initial.templateName}
              </div>
            </div>
            <div className="w-56">
              <Label htmlFor="caseNumber" className="text-xs">
                Số biên bản (tuỳ chọn)
              </Label>
              <Input
                id="caseNumber"
                value={caseNumber}
                onChange={(e) => {
                  setCaseNumber(e.target.value);
                  setDirty(true);
                }}
                placeholder="VD: 042/2026"
              />
            </div>
            <Button type="button" variant="outline" onClick={() => attemptNav("preview")} disabled={saving}>
              <Eye className="mr-2 h-4 w-4" />
              Xem trước
            </Button>
            <Button type="button" onClick={onSaveClick} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => attemptNav("print")} disabled={saving}>
              <Printer className="mr-2 h-4 w-4" />
              In
            </Button>
          </div>

          <div>
            <Label className="text-xs">Variables ({initial.variables.length})</Label>
            <div className="mt-1">
              <CaseVariablePanel
                variables={initial.variables}
                values={values}
                onChange={onValueChange}
                editorRef={editorRef}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="ml-12">
        <RichEditor
          ref={editorRef}
          initialHtml={initial.finalContentHtml}
          editable
          onChange={() => setDirty(true)}
          toolbar={(editor) => <EditorToolbar editor={editor} />}
        />
      </div>

      <MissingVarsDialog
        open={missingOpen}
        missing={missingVars.map((v) => v.name)}
        onCancel={() => {
          setMissingOpen(false);
          setPendingNav(null);
        }}
        onContinue={onContinueAnyway}
      />
    </div>
  );
}
