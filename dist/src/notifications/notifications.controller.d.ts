import { NotificationsService } from './notifications.service';
import { NotificationQueryDto } from './dto/notification.dto';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(user: JwtPayload, query: NotificationQueryDto): Promise<import("../common/dto/paginated-result.dto").PaginatedResult<any>>;
    markAllAsRead(user: JwtPayload): Promise<{
        message: string;
    }>;
    markAsRead(id: string, user: JwtPayload): Promise<{
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
    delete(id: string, user: JwtPayload): Promise<{
        message: string;
    }>;
}
