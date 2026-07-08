export declare class CreateSubscriptionPlanDto {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    durationDays: number;
    features: string[];
    isActive?: boolean;
}
export declare class UpdateSubscriptionPlanDto {
    name?: string;
    description?: string;
    price?: number;
    currency?: string;
    durationDays?: number;
    features?: string[];
    isActive?: boolean;
}
export declare class SubscriptionPlanQueryDto {
    isActive?: boolean;
    page?: number;
    limit?: number;
}
export declare class PurchaseSubscriptionDto {
    planId: string;
}
export declare class AdminSubscriptionQueryDto {
    page: number;
    limit: number;
    userId?: string;
    planId?: string;
}
