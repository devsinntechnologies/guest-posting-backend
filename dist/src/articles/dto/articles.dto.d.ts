import { ArticleStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class CreateArticleDto {
    title: string;
    content: string;
    excerpt?: string;
    featuredImageUrl?: string;
    categoryId?: string;
    targetUrl?: string;
    anchorText?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    tagIds?: string[];
    submit?: boolean;
}
export declare class UpdateArticleDto {
    title?: string;
    content?: string;
    excerpt?: string;
    featuredImageUrl?: string;
    categoryId?: string;
    targetUrl?: string;
    anchorText?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    tagIds?: string[];
}
export declare class UpdateArticleStatusDto {
    status: ArticleStatus;
    rejectionReason?: string;
    categoryId?: string;
    note?: string;
}
export declare class ArticleQueryDto extends PaginationDto {
    category?: string;
    tag?: string;
    search?: string;
    status?: ArticleStatus;
}
