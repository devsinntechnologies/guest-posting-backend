export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare function createPaginatedResult<T>(items: T[], total: number, page: number, limit: number): PaginatedResult<T>;
