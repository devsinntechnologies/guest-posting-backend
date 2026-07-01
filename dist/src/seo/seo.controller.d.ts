import { SeoService } from './seo.service';
import { CreateSeoPageDto, BulkGenerateSeoDto, SeoPageQueryDto, UpdateSeoMetaDto } from './dto/seo.dto';
export declare class SeoController {
    private seoService;
    constructor(seoService: SeoService);
    findAll(query: SeoPageQueryDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        metaTitle: string | null;
        metaDescription: string | null;
        pageType: import("@prisma/client").$Enums.SeoPageType;
        referenceId: string | null;
        h1Heading: string | null;
        customContent: string | null;
    }>>;
    findBySlug(slug: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        metaTitle: string | null;
        metaDescription: string | null;
        pageType: import("@prisma/client").$Enums.SeoPageType;
        referenceId: string | null;
        h1Heading: string | null;
        customContent: string | null;
    }>;
    getSitemapData(): Promise<{
        articles: {
            loc: string;
            lastmod: Date;
            publishedAt: Date | null;
        }[];
        seoPages: {
            loc: string;
            lastmod: Date;
            pageType: import("@prisma/client").$Enums.SeoPageType;
        }[];
    }>;
    create(dto: CreateSeoPageDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        metaTitle: string | null;
        metaDescription: string | null;
        pageType: import("@prisma/client").$Enums.SeoPageType;
        referenceId: string | null;
        h1Heading: string | null;
        customContent: string | null;
    }>;
    bulkGenerate(dto: BulkGenerateSeoDto): Promise<{
        created: number;
        pages: unknown[];
    }>;
    update(id: string, dto: UpdateSeoMetaDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        metaTitle: string | null;
        metaDescription: string | null;
        pageType: import("@prisma/client").$Enums.SeoPageType;
        referenceId: string | null;
        h1Heading: string | null;
        customContent: string | null;
    }>;
}
