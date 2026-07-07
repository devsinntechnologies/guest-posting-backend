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
    async getAdminStats() {
        const [publishedContent, pendingReviewContent, totalUsers, totalSubscriptions, completedPayments, totalComments,] = await Promise.all([
            this.prisma.content.count({
                where: { status: client_1.ContentStatus.PUBLISHED, deletedAt: null },
            }),
            this.prisma.content.count({
                where: { status: client_1.ContentStatus.PENDING_REVIEW, deletedAt: null },
            }),
            this.prisma.user.count({
                where: { isActive: true, deletedAt: null },
            }),
            this.prisma.subscription.count(),
            this.prisma.payment.aggregate({
                where: { status: client_1.PaymentStatus.COMPLETED },
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.comment.count({
                where: { deletedAt: null },
            }),
        ]);
        return {
            publishedContent,
            pendingReviewContent,
            totalUsers,
            totalSubscriptions,
            revenue: {
                totalAmount: completedPayments._sum.amount || 0,
                completedCount: completedPayments._count,
            },
            totalComments,
        };
    }
    async getRecentActivity(limit = 15) {
        return this.prisma.reviewEvent.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                actor: { select: { id: true, name: true, role: true } },
                content: { select: { id: true, title: true, slug: true } },
            },
        });
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map