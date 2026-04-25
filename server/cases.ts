import { prisma } from "@/lib/prisma";

export async function getCaseForEdit(id: string, userId: string) {
  const c = await prisma.violationCase.findUnique({
    where: { id },
    include: {
      template: { include: { variables: { orderBy: { createdAt: "asc" } } } },
      values: true
    }
  });
  if (!c || c.officerId !== userId) return null;
  return c;
}

export async function getCaseForPreview(id: string, userId: string) {
  const c = await prisma.violationCase.findUnique({
    where: { id },
    include: { template: { select: { name: true } } }
  });
  if (!c || c.officerId !== userId) return null;
  return c;
}

export async function createCase(input: {
  templateId: string;
  officerId: string;
  finalContentHtml: string;
  caseNumber?: string | null;
  values: Array<{ variableId: string; value: string }>;
}) {
  return prisma.$transaction(async (tx) => {
    const created = await tx.violationCase.create({
      data: {
        templateId: input.templateId,
        officerId: input.officerId,
        caseNumber: input.caseNumber ?? null,
        finalContentHtml: input.finalContentHtml,
        values: {
          create: input.values.map((v) => ({ variableId: v.variableId, value: v.value }))
        }
      }
    });
    await tx.documentTemplate.update({
      where: { id: input.templateId },
      data: { lastUsedAt: new Date() }
    });
    return created;
  });
}

export async function updateCase(input: {
  id: string;
  userId: string;
  finalContentHtml: string;
  caseNumber?: string | null;
  values: Array<{ variableId: string; value: string }>;
}) {
  const c = await prisma.violationCase.findUnique({
    where: { id: input.id },
    select: { officerId: true, templateId: true }
  });
  if (!c) throw new Error("NOT_FOUND");
  if (c.officerId !== input.userId) throw new Error("FORBIDDEN");

  return prisma.$transaction(async (tx) => {
    await tx.violationCase.update({
      where: { id: input.id },
      data: {
        finalContentHtml: input.finalContentHtml,
        caseNumber: input.caseNumber ?? null
      }
    });
    for (const v of input.values) {
      await tx.violationCaseValue.upsert({
        where: { caseId_variableId: { caseId: input.id, variableId: v.variableId } },
        update: { value: v.value },
        create: { caseId: input.id, variableId: v.variableId, value: v.value }
      });
    }
  });
}

export async function markPrinted(id: string, userId: string) {
  const c = await prisma.violationCase.findUnique({ where: { id }, select: { officerId: true } });
  if (!c || c.officerId !== userId) return;
  await prisma.violationCase.update({ where: { id }, data: { printedAt: new Date() } });
}
