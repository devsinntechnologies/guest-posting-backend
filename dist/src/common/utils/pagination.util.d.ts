export declare function getPrismaSkipTake(page: number, limit: number): {
    skip: number;
    take: number;
};
export declare function getPrismaOrderBy(sortBy: string | undefined, sortOrder?: 'asc' | 'desc', allowedFields?: string[]): Record<string, 'asc' | 'desc'>;
