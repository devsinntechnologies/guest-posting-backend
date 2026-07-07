import { BlockType, ContentStatus, ContentType } from '@prisma/client';
export declare class CreateContentBlockDto {
    type: BlockType;
    position: number;
    textContent?: string;
    mediaId?: string;
    metadata?: Record<string, unknown>;
}
export declare class CreateContentDto {
    title: string;
    contentType?: ContentType;
    excerpt?: string;
    description?: string;
    categoryId?: string;
    coverImageId?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    blocks?: CreateContentBlockDto[];
}
export declare class UpdateContentDto {
    title?: string;
    excerpt?: string;
    description?: string;
    categoryId?: string;
    coverImageId?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    blocks?: CreateContentBlockDto[];
}
export declare class SubmitContentDto {
    note?: string;
}
export declare class ContentQueryDto {
    page: number;
    limit: number;
    search?: string;
    contentType?: ContentType;
    categoryId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class AdminContentQueryDto extends ContentQueryDto {
    status?: ContentStatus;
    authorId?: string;
}
export declare class ReviewActionDto {
    note?: string;
}
