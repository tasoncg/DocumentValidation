import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getCaseForPreview } from "@/server/cases";
import { PrintableDocument } from "@/components/printable-document";

interface Props {
  params: { id: string };
  searchParams: { allow_missing?: string };
}

export default async function PreviewPage({ params, searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const c = await getCaseForPreview(params.id, user.id);
  if (!c) notFound();

  const allowMissing = searchParams.allow_missing === "1";

  return (
    <div
      className="preview-backdrop -mx-4 -my-6"
      data-empty-vars={allowMissing ? "1" : undefined}
    >
      <div className="preview-toolbar mb-4 flex items-center justify-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href={`/cases/${c.id}`}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Quay lại
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          {c.template.name} {c.caseNumber ? `— ${c.caseNumber}` : ""}
        </span>
        <Button asChild size="sm">
          <Link href={`/cases/${c.id}/preview-print${allowMissing ? "?allow_missing=1" : ""}`}>
            <Printer className="mr-1 h-4 w-4" />
            In
          </Link>
        </Button>
      </div>

      <div className="preview-page-wrapper">
        <PrintableDocument html={c.finalContentHtml} />
      </div>
    </div>
  );
}
