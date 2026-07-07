import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(): Promise<{
        publishedContent: number;
        pendingReviewContent: number;
        totalUsers: number;
        totalSubscriptions: number;
        revenue: {
            totalAmount: number | import("@prisma/client/runtime/library").Decimal;
            completedCount: number;
        };
        totalComments: number;
    }>;
    getRecentActivity(limit?: number): Promise<({
        content: {
            id: string;
            slug: string;
            title: string;
        };
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
}
