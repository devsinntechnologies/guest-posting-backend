import { PaymentStatus } from '@prisma/client';
export declare class InitiatePaymentDto {
    planId: string;
}
export declare class PaymentQueryDto {
    page: number;
    limit: number;
    status?: PaymentStatus;
}
export declare class AdminPaymentQueryDto extends PaymentQueryDto {
    userId?: string;
    providerTransactionId?: string;
}
