import { prisma } from "@/lib/prisma";

async function assertTemplateOwner(templateId: string, userId: string) {
  const t = await prisma.documentTemplate.findUnique({
    where: { id: templateId },
    select: { createdById: true }
  });
  if (!t) throw new Error("NOT_FOUND");
  if (t.createdById !== userId) throw new Error("FORBIDDEN");
}

export async function listVariables(templateId: string) {
  return prisma.documentVariable.findMany({
    where: { templateId },
    orderBy: { createdAt: "asc" }
  });
}

export async function createVariable(input: {
  templateId: string;
  userId: string;
  name: string;
  originalText: string;
  placeholderKey: string;
  appearanceCount: number;
}) {
  await assertTemplateOwner(input.templateId, input.userId);
  return prisma.documentVariable.create({
    data: {
      templateId: input.templateId,
      name: input.name,
      originalText: input.originalText,
      placeholderKey: input.placeholderKey,
      appearanceCount: input.appearanceCount
    }
  });
}

export async function updateVariable(input: {
  id: string;
  userId: string;
  name?: string;
  appearanceCount?: number;
}) {
  const v = await prisma.documentVariable.findUnique({
    where: { id: input.id },
    include: { template: { select: { createdById: true } } }
  });
  if (!v) throw new Error("NOT_FOUND");
  if (v.template.createdById !== input.userId) throw new Error("FORBIDDEN");
  return prisma.documentVariable.update({
    where: { id: input.id },
    data: { name: input.name, appearanceCount: input.appearanceCount }
  });
}

export async function deleteVariable(id: string, userId: string) {
  const v = await prisma.documentVariable.findUnique({
    where: { id },
    include: { template: { select: { createdById: true } } }
  });
  if (!v) throw new Error("NOT_FOUND");
  if (v.template.createdById !== userId) throw new Error("FORBIDDEN");
  return prisma.documentVariable.delete({ where: { id } });
}
