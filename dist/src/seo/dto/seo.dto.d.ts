import { SeoPageType } from '@prisma/client';
export declare class CreateSeoPageDto {
    slug: string;
    type: SeoPageType;
    title: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    ogImage?: string;
    canonicalUrl?: string;
    categoryId?: string;
    isActive?: boolean;
}
export declare class UpdateSeoPageDto {
    slug?: string;
    type?: SeoPageType;
    title?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    ogImage?: string;
    canonicalUrl?: string;
    categoryId?: string;
    isActive?: boolean;
}
export declare class SeoPageQueryDto {
    page: number;
    limit: number;
    type?: SeoPageType;
}
