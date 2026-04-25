"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createCase as createCaseRow, updateCase as updateCaseRow } from "@/server/cases";

export async function createCaseAction(input: {
  templateId: string;
  finalContentHtml: string;
  caseNumber?: string | null;
  values: Array<{ variableId: string; value: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  const c = await createCaseRow({ ...input, officerId: user.id });
  revalidatePath("/templates");
  revalidatePath(`/cases/${c.id}`);
  return { id: c.id };
}

export async function updateCaseAction(input: {
  id: string;
  finalContentHtml: string;
  caseNumber?: string | null;
  values: Array<{ variableId: string; value: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  await updateCaseRow({ ...input, userId: user.id });
  revalidatePath(`/cases/${input.id}`);
}
