import { SeoService } from './seo.service';
import { CreateSeoPageDto, SeoPageQueryDto, UpdateSeoPageDto } from './dto/seo.dto';
export declare class SeoController {
    private readonly seoService;
    constructor(seoService: SeoService);
    findAll(query: SeoPageQueryDto): Promise<import("../common/dto/paginated-result.dto").PaginatedResult<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        title: string;
        categoryId: string | null;
        type: import("@prisma/client").$Enums.SeoPageType;
        ogImage: string | null;
        canonicalUrl: string | null;
    }>>;
    findBySlug(slug: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        title: string;
        categoryId: string | null;
        type: import("@prisma/client").$Enums.SeoPageType;
        ogImage: string | null;
        canonicalUrl: string | null;
    }>;
    getSitemapData(): Promise<{
        content: {
            loc: string;
            lastmod: Date;
            publishedAt: Date | null;
        }[];
        categories: {
            loc: string;
            lastmod: Date;
        }[];
        seoPages: {
            loc: string;
            lastmod: Date;
            type: import("@prisma/client").$Enums.SeoPageType;
        }[];
    }>;
    create(dto: CreateSeoPageDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        title: string;
        categoryId: string | null;
        type: import("@prisma/client").$Enums.SeoPageType;
        ogImage: string | null;
        canonicalUrl: string | null;
    }>;
    update(id: string, dto: UpdateSeoPageDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        title: string;
        categoryId: string | null;
        type: import("@prisma/client").$Enums.SeoPageType;
        ogImage: string | null;
        canonicalUrl: string | null;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
