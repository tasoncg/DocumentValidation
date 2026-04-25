import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTemplateForEdit } from "@/server/templates";
import { CaseEditorPage } from "@/components/cases/case-editor-page";

interface Props {
  params: { id: string };
}

export default async function NewCasePage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const tpl = await getTemplateForEdit(params.id, user.id);
  if (!tpl) notFound();

  return (
    <CaseEditorPage
      mode="new"
      initial={{
        caseNumber: null,
        finalContentHtml: tpl.contentHtml,
        templateId: tpl.id,
        templateName: tpl.name,
        variables: tpl.variables.map((v) => ({
          id: v.id,
          name: v.name,
          originalText: v.originalText,
          appearanceCount: v.appearanceCount
        })),
        values: {}
      }}
    />
  );
}
