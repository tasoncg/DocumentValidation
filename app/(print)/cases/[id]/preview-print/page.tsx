import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCaseForPreview } from "@/server/cases";
import { PrintableDocument } from "@/components/printable-document";
import { AutoPrint } from "@/components/cases/auto-print";

interface Props {
  params: { id: string };
}

export default async function PreviewPrintPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const c = await getCaseForPreview(params.id, user.id);
  if (!c) notFound();

  return (
    <>
      <AutoPrint caseId={c.id} />
      <PrintableDocument html={c.finalContentHtml} />
    </>
  );
}
