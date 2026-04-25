import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTemplateForEdit } from "@/server/templates";
import { TemplateEditorPage } from "@/components/templates/template-editor-page";

interface Props {
  params: { id: string };
}

export default async function EditTemplatePage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const tpl = await getTemplateForEdit(params.id, user.id);
  if (!tpl) notFound();

  return (
    <TemplateEditorPage
      mode="edit"
      initial={{
        id: tpl.id,
        orderNumber: tpl.orderNumber,
        name: tpl.name,
        contentHtml: tpl.contentHtml,
        variables: tpl.variables.map((v) => ({
          id: v.id,
          name: v.name,
          appearanceCount: v.appearanceCount,
          originalText: v.originalText
        }))
      }}
    />
  );
}
