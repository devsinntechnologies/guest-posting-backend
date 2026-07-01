"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats(userId, role) {
        if (role === client_1.UserRole.CONTRIBUTOR) {
            return this.getContributorStats(userId);
        }
        return this.getAdminStats();
    }
    async getContributorStats(userId) {
        const [submissions, byStatus, orders] = await Promise.all([
            this.prisma.article.count({
                where: { authorId: userId, deletedAt: null },
            }),
            this.prisma.article.groupBy({
                by: ['status'],
                where: { authorId: userId, deletedAt: null },
                _count: true,
            }),
            this.prisma.order.count({
                where: { userId, status: client_1.OrderStatus.PAID },
            }),
        ]);
        return {
            totalSubmissions: submissions,
            submissionsByStatus: byStatus.reduce((acc, item) => {
                acc[item.status] = item._count;
                return acc;
            }, {}),
            paidOrders: orders,
        };
    }
    async getAdminStats() {
        const [totalArticles, pendingReview, published, totalUsers, revenue, topArticles, recentSubmissions,] = await Promise.all([
            this.prisma.article.count({ where: { deletedAt: null } }),
            this.prisma.article.count({
                where: { status: client_1.ArticleStatus.PENDING_REVIEW, deletedAt: null },
            }),
            this.prisma.article.count({
                where: { status: client_1.ArticleStatus.PUBLISHED, deletedAt: null },
            }),
            this.prisma.user.count({ where: { deletedAt: null } }),
            this.prisma.order.aggregate({
                where: { status: client_1.OrderStatus.PAID },
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.article.findMany({
                where: { status: client_1.ArticleStatus.PUBLISHED, deletedAt: null },
                orderBy: { viewCount: 'desc' },
                take: 10,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    viewCount: true,
                    publishedAt: true,
                },
            }),
            this.prisma.article.count({
                where: {
                    createdAt: { gte: new Date(Date.now() - 30 * 86400000) },
                    deletedAt: null,
                },
            }),
        ]);
        return {
            totalArticles,
            pendingReview,
            published,
            totalUsers,
            revenue: {
                total: revenue._sum.amount || 0,
                orderCount: revenue._count,
            },
            topArticles,
            submissionsLast30Days: recentSubmissions,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map