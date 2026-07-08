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
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const paginated_result_dto_1 = require("../common/dto/paginated-result.dto");
const pagination_util_1 = require("../common/utils/pagination.util");
const client_1 = require("@prisma/client");
let SubscriptionsService = class SubscriptionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPlan(dto) {
        return this.prisma.subscriptionPlan.create({
            data: {
                name: dto.name,
                description: dto.description,
                price: dto.price,
                currency: dto.currency ?? 'USD',
                durationDays: dto.durationDays,
                features: dto.features,
                isActive: dto.isActive ?? true,
            },
        });
    }
    async updatePlan(id, dto) {
        const plan = await this.prisma.subscriptionPlan.findUnique({
            where: { id },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Subscription plan not found.');
        }
        return this.prisma.subscriptionPlan.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.price !== undefined && { price: dto.price }),
                ...(dto.currency !== undefined && { currency: dto.currency }),
                ...(dto.durationDays !== undefined && { durationDays: dto.durationDays }),
                ...(dto.features !== undefined && { features: dto.features }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            },
        });
    }
    async deletePlan(id) {
        const plan = await this.prisma.subscriptionPlan.findUnique({
            where: { id },
            include: { subscriptions: { take: 1 } },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Subscription plan not found.');
        }
        if (plan.subscriptions.length > 0) {
            await this.prisma.subscriptionPlan.update({
                where: { id },
                data: { isActive: false },
            });
            return { message: 'Plan deactivated because it has active subscriptions.' };
        }
        await this.prisma.subscriptionPlan.delete({
            where: { id },
        });
        return { message: 'Subscription plan deleted successfully.' };
    }
    async findAllPlans(query) {
        const { page = 1, limit = 20 } = query;
        const { skip, take } = (0, pagination_util_1.getPrismaSkipTake)(page, limit);
        const where = {
            ...(query.isActive !== undefined && { isActive: query.isActive }),
        };
        const [items, total] = await Promise.all([
            this.prisma.subscriptionPlan.findMany({
                where,
                orderBy: { price: 'asc' },
                skip,
                take,
            }),
            this.prisma.subscriptionPlan.count({ where }),
        ]);
        return (0, paginated_result_dto_1.createPaginatedResult)(items, total, page, limit);
    }
    async findPlanById(id) {
        const plan = await this.prisma.subscriptionPlan.findUnique({
            where: { id },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Subscription plan not found.');
        }
        return plan;
    }
    async getMyActiveSubscription(userId) {
        const now = new Date();
        return this.prisma.subscription.findFirst({
            where: {
                userId,
                status: client_1.SubscriptionStatus.ACTIVE,
                startDate: { lte: now },
                endDate: { gte: now },
            },
            include: { plan: true },
        });
    }
    async adminFindAllSubscriptions(query) {
        const { page, limit, userId, planId } = query;
        const { skip, take } = (0, pagination_util_1.getPrismaSkipTake)(page, limit);
        const where = {
            ...(userId && { userId }),
            ...(planId && { planId }),
        };
        const [items, total] = await Promise.all([
            this.prisma.subscription.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    plan: { select: { id: true, name: true, price: true } },
                },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.subscription.count({ where }),
        ]);
        return (0, paginated_result_dto_1.createPaginatedResult)(items, total, page, limit);
    }
    async activateSubscription(userId, planId, durationDays) {
        const now = new Date();
        const existing = await this.getMyActiveSubscription(userId);
        let startDate = now;
        let endDate = new Date();
        if (existing) {
            startDate = existing.startDate;
            endDate = new Date(existing.endDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
            return this.prisma.subscription.update({
                where: { id: existing.id },
                data: {
                    endDate,
                    planId,
                },
            });
        }
        else {
            endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
            return this.prisma.subscription.create({
                data: {
                    userId,
                    planId,
                    startDate,
                    endDate,
                    status: client_1.SubscriptionStatus.ACTIVE,
                },
            });
        }
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map