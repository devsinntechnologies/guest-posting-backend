import { PrismaService } from '../prisma/prisma.service';
import { AdminContentQueryDto, ContentQueryDto, CreateContentDto, SubmitContentDto, UpdateContentDto } from './dto/content.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
export declare class ContentService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(authorId: string, dto: CreateContentDto): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
        } | null;
        author: {
            id: string;
            name: string;
            avatarUrl: string | null;
        };
        coverImage: {
            id: string;
            url: string;
            altText: string | null;
        } | null;
        contentBlocks: ({
            media: {
                id: string;
                url: string;
                altText: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.BlockType;
            position: number;
            textContent: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            contentId: string;
            mediaId: string | null;
        })[];
        _count: {
            comments: number;
            likes: number;
        };
    } & {
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        title: string;
        excerpt: string | null;
        authorId: string;
        categoryId: string | null;
        contentType: import("@prisma/client").$Enums.ContentType;
        status: import("@prisma/client").$Enums.ContentStatus;
        coverImageId: string | null;
        readingTimeMinutes: number;
        viewCount: number;
        publishedAt: Date | null;
    }>;
    update(contentId: string, userId: string, dto: UpdateContentDto): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
        } | null;
        author: {
            id: string;
            name: string;
            avatarUrl: string | null;
        };
        coverImage: {
            id: string;
            url: string;
            altText: string | null;
        } | null;
        contentBlocks: ({
            media: {
                id: string;
                url: string;
                altText: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.BlockType;
            position: number;
            textContent: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            contentId: string;
            mediaId: string | null;
        })[];
        _count: {
            comments: number;
            likes: number;
        };
    } & {
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        title: string;
        excerpt: string | null;
        authorId: string;
        categoryId: string | null;
        contentType: import("@prisma/client").$Enums.ContentType;
        status: import("@prisma/client").$Enums.ContentStatus;
        coverImageId: string | null;
        readingTimeMinutes: number;
        viewCount: number;
        publishedAt: Date | null;
    }>;
    submit(contentId: string, userId: string, dto: SubmitContentDto): Promise<{
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        title: string;
        excerpt: string | null;
        authorId: string;
        categoryId: string | null;
        contentType: import("@prisma/client").$Enums.ContentType;
        status: import("@prisma/client").$Enums.ContentStatus;
        coverImageId: string | null;
        readingTimeMinutes: number;
        viewCount: number;
        publishedAt: Date | null;
    }>;
    resubmit(contentId: string, userId: string, dto: SubmitContentDto): Promise<{
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        title: string;
        excerpt: string | null;
        authorId: string;
        categoryId: string | null;
        contentType: import("@prisma/client").$Enums.ContentType;
        status: import("@prisma/client").$Enums.ContentStatus;
        coverImageId: string | null;
        readingTimeMinutes: number;
        viewCount: number;
        publishedAt: Date | null;
    }>;
    delete(contentId: string, userId: string): Promise<{
        message: string;
    }>;
    findPublished(query: ContentQueryDto): Promise<PaginatedResult<any>>;
    findBySlug(slug: string): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
        } | null;
        author: {
            id: string;
            name: string;
            avatarUrl: string | null;
        };
        coverImage: {
            id: string;
            url: string;
            altText: string | null;
        } | null;
        contentBlocks: ({
            media: {
                id: string;
                url: string;
                altText: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.BlockType;
            position: number;
            textContent: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            contentId: string;
            mediaId: string | null;
        })[];
        _count: {
            comments: number;
            likes: number;
        };
    } & {
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        title: string;
        excerpt: string | null;
        authorId: string;
        categoryId: string | null;
        contentType: import("@prisma/client").$Enums.ContentType;
        status: import("@prisma/client").$Enums.ContentStatus;
        coverImageId: string | null;
        readingTimeMinutes: number;
        viewCount: number;
        publishedAt: Date | null;
    }>;
    findById(id: string): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
        } | null;
        author: {
            id: string;
            name: string;
            avatarUrl: string | null;
        };
        coverImage: {
            id: string;
            url: string;
            altText: string | null;
        } | null;
        contentBlocks: ({
            media: {
                id: string;
                url: string;
                altText: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.BlockType;
            position: number;
            textContent: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            contentId: string;
            mediaId: string | null;
        })[];
        _count: {
            comments: number;
            likes: number;
        };
    } & {
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        title: string;
        excerpt: string | null;
        authorId: string;
        categoryId: string | null;
        contentType: import("@prisma/client").$Enums.ContentType;
        status: import("@prisma/client").$Enums.ContentStatus;
        coverImageId: string | null;
        readingTimeMinutes: number;
        viewCount: number;
        publishedAt: Date | null;
    }>;
    findMyContent(userId: string, query: ContentQueryDto): Promise<PaginatedResult<any>>;
    findAllAdmin(query: AdminContentQueryDto): Promise<PaginatedResult<any>>;
    getReviewHistory(contentId: string): Promise<({
        actor: {
            id: string;
            name: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        contentId: string;
        note: string | null;
        actorId: string;
        action: import("@prisma/client").$Enums.ReviewAction;
        fromStatus: import("@prisma/client").$Enums.ContentStatus | null;
        toStatus: import("@prisma/client").$Enums.ContentStatus;
    })[]>;
    adminDelete(contentId: string): Promise<{
        message: string;
    }>;
}
