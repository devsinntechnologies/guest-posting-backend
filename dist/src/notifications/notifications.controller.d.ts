import { NotificationsService } from './notifications.service';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
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
}
