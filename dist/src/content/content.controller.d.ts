import { ContentService } from './content.service';
import { AdminContentQueryDto, ContentQueryDto, CreateContentDto, SubmitContentDto, UpdateContentDto } from './dto/content.dto';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
export declare class ContentController {
    private readonly contentService;
    constructor(contentService: ContentService);
    findPublished(query: ContentQueryDto): Promise<import("../common/dto/paginated-result.dto").PaginatedResult<any>>;
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
    create(user: JwtPayload, dto: CreateContentDto): Promise<{
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
    findMy(user: JwtPayload, query: ContentQueryDto): Promise<import("../common/dto/paginated-result.dto").PaginatedResult<any>>;
    update(id: string, user: JwtPayload, dto: UpdateContentDto): Promise<{
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
    submit(id: string, user: JwtPayload, dto: SubmitContentDto): Promise<{
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
    resubmit(id: string, user: JwtPayload, dto: SubmitContentDto): Promise<{
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
    delete(id: string, user: JwtPayload): Promise<{
        message: string;
    }>;
    findAllAdmin(query: AdminContentQueryDto): Promise<import("../common/dto/paginated-result.dto").PaginatedResult<any>>;
    getReviewHistory(id: string): Promise<({
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
    adminDelete(id: string): Promise<{
        message: string;
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
}
