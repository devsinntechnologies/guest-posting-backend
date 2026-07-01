import { PrismaService } from '../prisma/prisma.service';
import { CreateSponsoredPostDto, UpdateSponsoredPostDto } from './dto/sponsored-posts.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class SponsoredPostsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        user: {
            id: string;
            name: string;
        };
        article: {
            id: string;
            slug: string;
            title: string;
        };
    } & {
        id: string;
        isActive: boolean;
        userId: string;
        articleId: string;
        startDate: Date;
        endDate: Date;
        placement: import("@prisma/client").$Enums.SponsoredPlacement;
    }>>;
    findActive(placement?: string): Promise<({
        article: {
            id: string;
            slug: string;
            title: string;
            excerpt: string | null;
            featuredImageUrl: string | null;
        };
    } & {
        id: string;
        isActive: boolean;
        userId: string;
        articleId: string;
        startDate: Date;
        endDate: Date;
        placement: import("@prisma/client").$Enums.SponsoredPlacement;
    })[]>;
    create(dto: CreateSponsoredPostDto, userId: string): Promise<{
        article: {
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            metaTitle: string | null;
            metaDescription: string | null;
            title: string;
            content: string;
            excerpt: string | null;
            featuredImageUrl: string | null;
            authorId: string;
            categoryId: string | null;
            status: import("@prisma/client").$Enums.ArticleStatus;
            targetUrl: string | null;
            anchorText: string | null;
            metaKeywords: string | null;
            readingTimeMinutes: number;
            viewCount: number;
            rejectionReason: string | null;
            publishedAt: Date | null;
        };
    } & {
        id: string;
        isActive: boolean;
        userId: string;
        articleId: string;
        startDate: Date;
        endDate: Date;
        placement: import("@prisma/client").$Enums.SponsoredPlacement;
    }>;
    update(id: string, dto: UpdateSponsoredPostDto): Promise<{
        id: string;
        isActive: boolean;
        userId: string;
        articleId: string;
        startDate: Date;
        endDate: Date;
        placement: import("@prisma/client").$Enums.SponsoredPlacement;
    }>;
    remove(id: string): Promise<{
        id: string;
        isActive: boolean;
        userId: string;
        articleId: string;
        startDate: Date;
        endDate: Date;
        placement: import("@prisma/client").$Enums.SponsoredPlacement;
    }>;
}
