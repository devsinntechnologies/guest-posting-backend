import { DashboardService } from './dashboard.service';
import { UserRole } from '@prisma/client';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(userId: string, role: UserRole): Promise<{
        totalSubmissions: number;
        submissionsByStatus: Record<string, number>;
        paidOrders: number;
    } | {
        totalArticles: number;
        pendingReview: number;
        published: number;
        totalUsers: number;
        revenue: {
            total: number | import("@prisma/client/runtime/library").Decimal;
            orderCount: number;
        };
        topArticles: {
            id: string;
            slug: string;
            title: string;
            viewCount: number;
            publishedAt: Date | null;
        }[];
        submissionsLast30Days: number;
    }>;
}
