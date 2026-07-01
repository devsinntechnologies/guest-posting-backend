import { PrismaService } from '../prisma/prisma.service';
import { ArticleStatus, UserRole } from '@prisma/client';
export interface TransitionDto {
    articleId: string;
    toStatus: ArticleStatus;
    actorId: string;
    actorRole: UserRole;
    note?: string;
    rejectionReason?: string;
    categoryId?: string;
}
export declare class WorkflowService {
    private prisma;
    constructor(prisma: PrismaService);
    transition(dto: TransitionDto): Promise<{
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            description: string | null;
            metaTitle: string | null;
            metaDescription: string | null;
            parentCategoryId: string | null;
        } | null;
        author: {
            id: string;
            email: string;
            name: string;
        };
    } & {
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
    }>;
    getHistory(articleId: string): Promise<({
        actor: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        articleId: string;
        actorId: string;
        fromStatus: import("@prisma/client").$Enums.ArticleStatus | null;
        toStatus: import("@prisma/client").$Enums.ArticleStatus;
        note: string | null;
    })[]>;
}
