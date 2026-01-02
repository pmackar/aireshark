import prisma from "./db";

export type EntityType = "firm" | "platform" | "brand";

export const PIPELINE_STATUSES = [
  "watching",
  "researching",
  "contacted",
  "negotiating",
  "closed_won",
  "closed_lost",
] as const;

export const PRIORITIES = ["low", "medium", "high", "critical"] as const;

interface PipelineEntityIds {
  privateEquityFirmId?: string;
  platformId?: string;
  brandId?: string;
}

export function getEntityIdField(entityType: EntityType): keyof PipelineEntityIds {
  switch (entityType) {
    case "firm":
      return "privateEquityFirmId";
    case "platform":
      return "platformId";
    case "brand":
      return "brandId";
  }
}

export async function getUserPipelines(userId: string) {
  return prisma.pipeline.findMany({
    where: { userId },
    include: {
      _count: {
        select: { items: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPipelineWithItems(pipelineId: string, userId: string) {
  return prisma.pipeline.findFirst({
    where: {
      id: pipelineId,
      userId,
    },
    include: {
      items: {
        include: {
          privateEquityFirm: { select: { name: true, slug: true } },
          platform: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
        },
        orderBy: [{ status: "asc" }, { addedAt: "desc" }],
      },
    },
  });
}

export async function createPipeline(
  userId: string,
  data: {
    name: string;
    description?: string;
    color?: string;
  }
) {
  return prisma.pipeline.create({
    data: {
      userId,
      name: data.name,
      description: data.description,
      color: data.color,
    },
  });
}

export async function updatePipeline(
  pipelineId: string,
  userId: string,
  data: {
    name?: string;
    description?: string | null;
    color?: string;
  }
) {
  return prisma.pipeline.updateMany({
    where: {
      id: pipelineId,
      userId,
    },
    data,
  });
}

export async function deletePipeline(pipelineId: string, userId: string) {
  return prisma.pipeline.deleteMany({
    where: {
      id: pipelineId,
      userId,
    },
  });
}

export async function addToPipeline(
  pipelineId: string,
  userId: string,
  entityType: EntityType,
  entityId: string,
  options?: {
    status?: string;
    priority?: string;
    notes?: string;
  }
) {
  const field = getEntityIdField(entityType);

  return prisma.pipelineItem.create({
    data: {
      pipelineId,
      userId,
      [field]: entityId,
      status: options?.status || "watching",
      priority: options?.priority,
      notes: options?.notes,
    },
  });
}

export async function updatePipelineItem(
  itemId: string,
  userId: string,
  updates: {
    status?: string;
    priority?: string | null;
    notes?: string | null;
  }
) {
  const data: { status?: string; priority?: string | null; notes?: string | null; statusChangedAt?: Date } = {};

  if (updates.status !== undefined) {
    data.status = updates.status;
    data.statusChangedAt = new Date();
  }
  if (updates.priority !== undefined) data.priority = updates.priority;
  if (updates.notes !== undefined) data.notes = updates.notes;

  return prisma.pipelineItem.updateMany({
    where: {
      id: itemId,
      userId,
    },
    data,
  });
}

export async function removeFromPipeline(itemId: string, userId: string) {
  return prisma.pipelineItem.deleteMany({
    where: {
      id: itemId,
      userId,
    },
  });
}
