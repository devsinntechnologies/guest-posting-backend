import { PrismaService } from '../prisma/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateArticleDto, UpdateArticleDto, UpdateArticleStatusDto, ArticleQueryDto } from './dto/articles.dto';
import { UserRole } from '@prisma/client';
export declare class ArticlesService {
    private prisma;
    private workflow;
    private notifications;
    constructor(prisma: PrismaService, workflow: WorkflowService, notifications: NotificationsService);
    findAll(query: ArticleQueryDto, userRole?: UserRole): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        category: {
            id: string;
            name: string;
            slug: string;
        } | null;
        articleTags: ({
            tag: {
                id: string;
                name: string;
                createdAt: Date;
                slug: string;
            };
        } & {
            tagId: string;
            articleId: string;
        })[];
        author: {
            id: string;
            name: string;
            avatarUrl: string | null;
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
    }>>;
    findBySlug(slug: string): Promise<{
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
        articleTags: ({
            tag: {
                id: string;
                name: string;
                createdAt: Date;
                slug: string;
            };
        } & {
            tagId: string;
            articleId: string;
        })[];
        author: {
            id: string;
            name: string;
            avatarUrl: string | null;
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
    findById(id: string): Promise<{
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
        articleTags: ({
            tag: {
                id: string;
                name: string;
                createdAt: Date;
                slug: string;
            };
        } & {
            tagId: string;
            articleId: string;
        })[];
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
    mySubmissions(userId: string, query: ArticleQueryDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        category: {
            id: string;
            name: string;
            slug: string;
        } | null;
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
    }>>;
    create(dto: CreateArticleDto, authorId: string): Promise<{
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
        articleTags: ({
            tag: {
                id: string;
                name: string;
                createdAt: Date;
                slug: string;
            };
        } & {
            tagId: string;
            articleId: string;
        })[];
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
    update(id: string, dto: UpdateArticleDto, userId: string, userRole: UserRole): Promise<{
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
        articleTags: ({
            tag: {
                id: string;
                name: string;
                createdAt: Date;
                slug: string;
            };
        } & {
            tagId: string;
            articleId: string;
        })[];
        author: {
            id: string;
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
    updateStatus(id: string, dto: UpdateArticleStatusDto, actorId: string, actorRole: UserRole): Promise<{
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
    softDelete(id: string, userId: string, userRole: UserRole): Promise<{
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
    private assertCanEdit;
    private onSubmit;
    private onStatusChange;
}
