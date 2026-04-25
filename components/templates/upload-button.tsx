"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export interface ParsedDocx {
  html: string;
  originalFileName: string;
}

interface Props {
  onParsed: (parsed: ParsedDocx) => void;
}

export function UploadButton({ onParsed }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/templates/parse", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Upload thất bại", description: data.error ?? "Lỗi không xác định.", variant: "destructive" });
        return;
      }
      onParsed({ html: data.html, originalFileName: data.originalFileName });
    } catch (err) {
      toast({ title: "Upload thất bại", description: String(err), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <Button type="button" disabled={busy} onClick={() => inputRef.current?.click()}>
        <Upload className="mr-2 h-4 w-4" />
        {busy ? "Đang xử lý..." : "Upload file .docx"}
      </Button>
    </>
  );
}
