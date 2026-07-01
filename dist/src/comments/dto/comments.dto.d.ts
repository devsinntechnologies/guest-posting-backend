import { CommentStatus } from '@prisma/client';
export declare class CreateCommentDto {
    content: string;
    parentCommentId?: string;
    guestName?: string;
    guestEmail?: string;
}
export declare class ModerateCommentDto {
    status: CommentStatus;
}
