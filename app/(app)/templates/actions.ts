"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  createTemplate as createTemplateRow,
  updateTemplate as updateTemplateRow,
  deleteTemplate as deleteTemplateRow
} from "@/server/templates";

export async function createTemplateAction(input: {
  name: string;
  contentHtml: string;
  originalFileName: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  const t = await createTemplateRow({ ...input, userId: user.id });
  revalidatePath("/templates");
  return { id: t.id, orderNumber: t.orderNumber };
}

export async function updateTemplateAction(id: string, data: { name?: string; contentHtml?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  await updateTemplateRow(id, user.id, data);
  revalidatePath("/templates");
  revalidatePath(`/templates/${id}/edit`);
}

export async function deleteTemplateAction(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  try {
    await deleteTemplateRow(id, user.id);
  } catch (err) {
    const code = (err as Error).message;
    if (code === "FORBIDDEN") return { error: "Bạn không có quyền xoá văn bản này." };
    if (code === "NOT_FOUND") return { error: "Văn bản không tồn tại." };
    throw err;
  }
  revalidatePath("/templates");
  return { ok: true as const };
}

export async function navigateAfterCreate(id: string): Promise<never> {
  redirect(`/templates/${id}/edit`);
}
