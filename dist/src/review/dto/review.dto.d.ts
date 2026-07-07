import { ContentType } from '@prisma/client';
export declare class ReviewActionDto {
    note?: string;
}
export declare class ReviewQueueQueryDto {
    page: number;
    limit: number;
    search?: string;
    contentType?: ContentType;
}
