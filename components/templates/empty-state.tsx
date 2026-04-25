import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-16 text-center">
      <FileText className="h-12 w-12 text-muted-foreground" />
      <h2 className="mt-4 text-lg font-semibold">Chưa có văn bản mẫu</h2>
      <p className="mt-1 text-sm text-muted-foreground">Upload file Word đầu tiên để bắt đầu.</p>
      <Button asChild className="mt-4">
        <Link href="/templates/new">
          <Plus className="mr-1 h-4 w-4" />
          Tạo mới văn bản mẫu
        </Link>
      </Button>
    </div>
  );
}
