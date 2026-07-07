/**
 * Converts pagination parameters into Prisma's skip/take values.
 */
export function getPrismaSkipTake(
  page: number,
  limit: number,
): { skip: number; take: number } {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
}

/**
 * Builds a Prisma orderBy object from sortBy and sortOrder.
 * Falls back to createdAt DESC when sortBy is not provided.
 */
export function getPrismaOrderBy(
  sortBy: string | undefined,
  sortOrder: 'asc' | 'desc' = 'desc',
  allowedFields: string[] = ['createdAt', 'updatedAt'],
): Record<string, 'asc' | 'desc'> {
  if (!sortBy || !allowedFields.includes(sortBy)) {
    return { createdAt: 'desc' };
  }
  return { [sortBy]: sortOrder };
}
