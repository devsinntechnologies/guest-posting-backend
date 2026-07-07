import { SubscriptionsService } from './subscriptions.service';
import { AdminSubscriptionQueryDto, CreateSubscriptionPlanDto, SubscriptionPlanQueryDto, UpdateSubscriptionPlanDto } from './dto/subscription.dto';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    findAllPlans(query: SubscriptionPlanQueryDto): Promise<{
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
    }[]>;
    findPlanById(id: string): Promise<{
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
    }>;
    createPlan(dto: CreateSubscriptionPlanDto): Promise<{
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
    }>;
    updatePlan(id: string, dto: UpdateSubscriptionPlanDto): Promise<{
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
    }>;
    deletePlan(id: string): Promise<{
        message: string;
    }>;
    getMySubscription(user: JwtPayload): Promise<({
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
    findAllSubscriptions(query: AdminSubscriptionQueryDto): Promise<import("../common/dto/paginated-result.dto").PaginatedResult<any>>;
}
