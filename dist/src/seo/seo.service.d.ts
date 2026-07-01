import { PrismaService } from '../prisma/prisma.service';
import { CreateSeoPageDto, BulkGenerateSeoDto, SeoPageQueryDto, UpdateSeoMetaDto } from './dto/seo.dto';
export declare class SeoService {
    private prisma;
    constructor(prisma: PrismaService);
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
    bulkGenerate(dto: BulkGenerateSeoDto): Promise<{
        created: number;
        pages: unknown[];
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
}
