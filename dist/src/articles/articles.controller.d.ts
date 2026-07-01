import { ArticlesService } from './articles.service';
import { CreateArticleDto, UpdateArticleDto, UpdateArticleStatusDto, ArticleQueryDto } from './dto/articles.dto';
import { UserRole } from '@prisma/client';
export declare class ArticlesController {
    private articlesService;
    constructor(articlesService: ArticlesService);
    findAll(query: ArticleQueryDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
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
    create(dto: CreateArticleDto, userId: string): Promise<{
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
    update(id: string, dto: UpdateArticleDto, userId: string, role: UserRole): Promise<{
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
    updateStatus(id: string, dto: UpdateArticleStatusDto, userId: string, role: UserRole): Promise<{
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
    remove(id: string, userId: string, role: UserRole): Promise<{
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
}
