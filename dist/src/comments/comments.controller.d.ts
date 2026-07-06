import { CommentsService } from './comments.service';
import { CreateCommentDto, ModerateCommentDto } from './dto/comments.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class CommentsController {
    private commentsService;
    constructor(commentsService: CommentsService);
    findByArticle(articleId: string, query: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        user: {
            id: string;
            name: string;
            avatarUrl: string | null;
        } | null;
        replies: ({
            user: {
                id: string;
                name: string;
                avatarUrl: string | null;
            } | null;
        } & {
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            content: string;
            status: import("@prisma/client").$Enums.CommentStatus;
            userId: string | null;
            articleId: string;
            parentCommentId: string | null;
            guestName: string | null;
            guestEmail: string | null;
        })[];
    } & {
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        content: string;
        status: import("@prisma/client").$Enums.CommentStatus;
        userId: string | null;
        articleId: string;
        parentCommentId: string | null;
        guestName: string | null;
        guestEmail: string | null;
    }>>;
    create(articleId: string, dto: CreateCommentDto, userId: string | undefined): Promise<{
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        content: string;
        status: import("@prisma/client").$Enums.CommentStatus;
        userId: string | null;
        articleId: string;
        parentCommentId: string | null;
        guestName: string | null;
        guestEmail: string | null;
    }>;
    findPending(query: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        user: {
            id: string;
            name: string;
            avatarUrl: string | null;
        } | null;
        article: {
            id: string;
            slug: string;
            title: string;
        };
    } & {
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        content: string;
        status: import("@prisma/client").$Enums.CommentStatus;
        userId: string | null;
        articleId: string;
        parentCommentId: string | null;
        guestName: string | null;
        guestEmail: string | null;
    }>>;
    moderate(id: string, dto: ModerateCommentDto): Promise<{
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        content: string;
        status: import("@prisma/client").$Enums.CommentStatus;
        userId: string | null;
        articleId: string;
        parentCommentId: string | null;
        guestName: string | null;
        guestEmail: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        content: string;
        status: import("@prisma/client").$Enums.CommentStatus;
        userId: string | null;
        articleId: string;
        parentCommentId: string | null;
        guestName: string | null;
        guestEmail: string | null;
    }>;
}
