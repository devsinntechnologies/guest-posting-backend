export declare class PaginationDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare function paginate<T>(items: T[], total: number, page: number, limit: number): PaginatedResult<T>;
export declare function getSkip(page: number, limit: number): number;
