import { CommentsService } from './comments.service';
import { CreateCommentDto, CommentQueryDto } from './dto/comment.dto';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    create(contentId: string, dto: CreateCommentDto, user: JwtPayload): Promise<{
        user: {
            id: string;
            name: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.CommentStatus;
        contentId: string;
        userId: string;
        body: string;
    }>;
    findByContent(contentId: string, query: CommentQueryDto): Promise<import("../common/dto/paginated-result.dto").PaginatedResult<any>>;
    hide(id: string): Promise<{
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.CommentStatus;
        contentId: string;
        userId: string;
        body: string;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
