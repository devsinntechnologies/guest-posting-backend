import { PrismaService } from '../prisma/prisma.service';
import { AdminSubscriptionQueryDto, CreateSubscriptionPlanDto, SubscriptionPlanQueryDto, UpdateSubscriptionPlanDto } from './dto/subscription.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
import { SubscriptionPlan } from '@prisma/client';
export declare class SubscriptionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createPlan(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan>;
    updatePlan(id: string, dto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan>;
    deletePlan(id: string): Promise<{
        message: string;
    }>;
    findAllPlans(query: SubscriptionPlanQueryDto): Promise<SubscriptionPlan[]>;
    findPlanById(id: string): Promise<SubscriptionPlan>;
    getMyActiveSubscription(userId: string): Promise<({
        plan: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            durationDays: number;
            features: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        userId: string;
        planId: string;
        startDate: Date;
        endDate: Date;
    }) | null>;
    adminFindAllSubscriptions(query: AdminSubscriptionQueryDto): Promise<PaginatedResult<any>>;
    activateSubscription(userId: string, planId: string, durationDays: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        userId: string;
        planId: string;
        startDate: Date;
        endDate: Date;
    }>;
}
