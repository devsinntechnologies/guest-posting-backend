import { PrismaService } from '../prisma/prisma.service';
import { CreateSeoPageDto, SeoPageQueryDto, UpdateSeoPageDto } from './dto/seo.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
import { SeoPage } from '@prisma/client';
export declare class SeoService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateSeoPageDto): Promise<SeoPage>;
    update(id: string, dto: UpdateSeoPageDto): Promise<SeoPage>;
    delete(id: string): Promise<{
        message: string;
    }>;
    findAll(query: SeoPageQueryDto): Promise<PaginatedResult<SeoPage>>;
    findBySlug(slug: string): Promise<SeoPage>;
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
}
