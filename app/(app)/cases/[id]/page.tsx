import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCaseForEdit } from "@/server/cases";
import { CaseEditorPage } from "@/components/cases/case-editor-page";

interface Props {
  params: { id: string };
}

export default async function CasePage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const c = await getCaseForEdit(params.id, user.id);
  if (!c) notFound();

  const valueMap: Record<string, string> = {};
  for (const v of c.values) valueMap[v.variableId] = v.value;

  return (
    <CaseEditorPage
      mode="edit"
      initial={{
        id: c.id,
        caseNumber: c.caseNumber,
        finalContentHtml: c.finalContentHtml,
        templateId: c.templateId,
        templateName: c.template.name,
        variables: c.template.variables.map((v) => ({
          id: v.id,
          name: v.name,
          originalText: v.originalText,
          appearanceCount: v.appearanceCount
        })),
        values: valueMap
      }}
    />
  );
}
