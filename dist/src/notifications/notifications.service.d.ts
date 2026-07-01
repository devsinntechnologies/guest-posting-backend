import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
export interface CreateNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
}
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string, query: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        type: import("@prisma/client").$Enums.NotificationType;
        message: string;
        isRead: boolean;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>>;
    markAsRead(id: string, userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    create(dto: CreateNotificationDto): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        type: import("@prisma/client").$Enums.NotificationType;
        message: string;
        isRead: boolean;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    notifySubmissionReceived(articleId: string, authorId: string): Promise<void>;
}
