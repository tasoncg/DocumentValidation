import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function listTemplatesForUser(userId: string) {
  return prisma.documentTemplate.findMany({
    where: { createdById: userId },
    include: { _count: { select: { cases: true } } },
    orderBy: [{ lastUsedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }]
  });
}

export type TemplateRow = Awaited<ReturnType<typeof listTemplatesForUser>>[number];

export async function createTemplate(input: {
  name: string;
  contentHtml: string;
  originalFileName: string;
  userId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const last = await tx.documentTemplate.findFirst({
      orderBy: { orderNumber: "desc" },
      select: { orderNumber: true }
    });
    const next = (last?.orderNumber ?? 0) + 1;
    return tx.documentTemplate.create({
      data: {
        orderNumber: next,
        name: input.name,
        originalFileName: input.originalFileName,
        contentHtml: input.contentHtml,
        createdById: input.userId
      }
    });
  });
}

export async function updateTemplate(
  id: string,
  userId: string,
  data: { name?: string; contentHtml?: string }
) {
  const existing = await prisma.documentTemplate.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");
  if (existing.createdById !== userId) throw new Error("FORBIDDEN");
  return prisma.documentTemplate.update({ where: { id }, data });
}

export async function getTemplateForEdit(id: string, userId: string) {
  const t = await prisma.documentTemplate.findUnique({
    where: { id },
    include: { variables: { orderBy: { createdAt: "asc" } } }
  });
  if (!t || t.createdById !== userId) return null;
  return t;
}

export async function deleteTemplate(id: string, userId: string) {
  const t = await prisma.documentTemplate.findUnique({ where: { id }, select: { createdById: true } });
  if (!t) throw new Error("NOT_FOUND");
  if (t.createdById !== userId) throw new Error("FORBIDDEN");
  await prisma.documentTemplate.delete({ where: { id } });
}

export async function bumpLastUsedAt(id: string, tx: Prisma.TransactionClient = prisma) {
  return tx.documentTemplate.update({ where: { id }, data: { lastUsedAt: new Date() } });
}
