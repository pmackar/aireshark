import prisma from "./db";

export type EntityType = "firm" | "platform" | "brand";

interface WatchlistEntityIds {
  privateEquityFirmId?: string;
  platformId?: string;
  brandId?: string;
}

export function getEntityIdField(entityType: EntityType): keyof WatchlistEntityIds {
  switch (entityType) {
    case "firm":
      return "privateEquityFirmId";
    case "platform":
      return "platformId";
    case "brand":
      return "brandId";
  }
}

export async function isEntityWatched(
  userId: string,
  entityType: EntityType,
  entityId: string
): Promise<{ isWatched: boolean; watchlistItemId: string | null }> {
  const field = getEntityIdField(entityType);

  const item = await prisma.watchlistItem.findFirst({
    where: {
      userId,
      [field]: entityId,
    },
    select: { id: true },
  });

  return {
    isWatched: !!item,
    watchlistItemId: item?.id || null,
  };
}

export async function addToWatchlist(
  userId: string,
  entityType: EntityType,
  entityId: string,
  options?: {
    notes?: string;
    emailOnNewArticle?: boolean;
    emailOnAcquisition?: boolean;
  }
) {
  const field = getEntityIdField(entityType);

  return prisma.watchlistItem.create({
    data: {
      userId,
      [field]: entityId,
      notes: options?.notes,
      emailOnNewArticle: options?.emailOnNewArticle ?? true,
      emailOnAcquisition: options?.emailOnAcquisition ?? true,
    },
  });
}

export async function removeFromWatchlist(itemId: string, userId: string) {
  return prisma.watchlistItem.deleteMany({
    where: {
      id: itemId,
      userId,
    },
  });
}

export async function getUserWatchlist(userId: string, entityType?: EntityType) {
  const where: { userId: string; privateEquityFirmId?: { not: null }; platformId?: { not: null }; brandId?: { not: null } } = { userId };

  if (entityType) {
    const field = getEntityIdField(entityType);
    where[field] = { not: null };
  }

  return prisma.watchlistItem.findMany({
    where,
    include: {
      privateEquityFirm: true,
      platform: true,
      brand: true,
    },
    orderBy: { addedAt: "desc" },
  });
}

export async function getWatchlistCounts(userId: string) {
  const [total, firms, platforms, brands] = await Promise.all([
    prisma.watchlistItem.count({ where: { userId } }),
    prisma.watchlistItem.count({ where: { userId, privateEquityFirmId: { not: null } } }),
    prisma.watchlistItem.count({ where: { userId, platformId: { not: null } } }),
    prisma.watchlistItem.count({ where: { userId, brandId: { not: null } } }),
  ]);

  return { total, firms, platforms, brands };
}

export function getEntityFromWatchlistItem(item: {
  privateEquityFirm: { name: string; slug: string } | null;
  platform: { name: string; slug: string } | null;
  brand: { name: string; slug: string } | null;
}): { type: EntityType; name: string; slug: string } | null {
  if (item.privateEquityFirm) {
    return {
      type: "firm",
      name: item.privateEquityFirm.name,
      slug: item.privateEquityFirm.slug,
    };
  }
  if (item.platform) {
    return {
      type: "platform",
      name: item.platform.name,
      slug: item.platform.slug,
    };
  }
  if (item.brand) {
    return {
      type: "brand",
      name: item.brand.name,
      slug: item.brand.slug,
    };
  }
  return null;
}
