import { PrismaService } from '../prisma/prisma.service';
import { NotificationQueryDto } from './dto/notification.dto';
import { NotificationType } from '@prisma/client';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string, query: NotificationQueryDto): Promise<PaginatedResult<any>>;
    markAsRead(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        type: import("@prisma/client").$Enums.NotificationType;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        message: string;
        isRead: boolean;
    }>;
    markAllAsRead(userId: string): Promise<{
        message: string;
    }>;
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
    create(dto: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        metadata?: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        type: import("@prisma/client").$Enums.NotificationType;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        message: string;
        isRead: boolean;
    }>;
}
