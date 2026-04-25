"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  createVariable as createVariableRow,
  updateVariable as updateVariableRow,
  deleteVariable as deleteVariableRow
} from "@/server/variables";

export async function createVariableAction(input: {
  templateId: string;
  name: string;
  originalText: string;
  placeholderKey: string;
  appearanceCount: number;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  const v = await createVariableRow({ ...input, userId: user.id });
  revalidatePath(`/templates/${input.templateId}/edit`);
  return { id: v.id, name: v.name };
}

export async function updateVariableAction(input: {
  id: string;
  templateId: string;
  name?: string;
  appearanceCount?: number;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  await updateVariableRow({ id: input.id, userId: user.id, name: input.name, appearanceCount: input.appearanceCount });
  revalidatePath(`/templates/${input.templateId}/edit`);
}

export async function deleteVariableAction(id: string, templateId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  await deleteVariableRow(id, user.id);
  revalidatePath(`/templates/${templateId}/edit`);
}
