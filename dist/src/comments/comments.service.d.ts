import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, CommentQueryDto } from './dto/comment.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
export declare class CommentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(contentId: string, userId: string, dto: CreateCommentDto): Promise<{
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
    findByContent(contentId: string, query: CommentQueryDto): Promise<PaginatedResult<any>>;
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
