import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listTemplatesForUser } from "@/server/templates";
import { TemplateTable } from "@/components/templates/template-table";
import { EmptyState } from "@/components/templates/empty-state";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const rows = await listTemplatesForUser(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Văn bản mẫu</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tạo, chỉnh sửa và sử dụng các template biên bản vi phạm.
          </p>
        </div>
        <Button asChild>
          <Link href="/templates/new">
            <Plus className="mr-1 h-4 w-4" />
            Tạo mới văn bản mẫu
          </Link>
        </Button>
      </div>

      {rows.length === 0 ? <EmptyState /> : <TemplateTable rows={rows} />}
    </div>
  );
}
