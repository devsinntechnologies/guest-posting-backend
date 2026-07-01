import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CheckoutDto } from './dto/payments.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class PaymentsController {
    private paymentsService;
    constructor(paymentsService: PaymentsService);
    checkout(userId: string, dto: CheckoutDto): Promise<{
        orderId: string;
        checkoutUrl: string;
        message: string;
    } | {
        orderId: string;
        checkoutUrl: string | null;
        message?: undefined;
    }>;
    webhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
        duplicate: boolean;
    } | {
        received: boolean;
        duplicate?: undefined;
    }>;
    myOrders(userId: string, query: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        package: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            features: import("@prisma/client/runtime/library").JsonValue;
            durationDays: number;
        } | null;
        article: {
            id: string;
            title: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        gatewayTransactionId: string | null;
        userId: string;
        packageId: string | null;
        articleId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentGateway: string;
        invoiceUrl: string | null;
    }>>;
    allOrders(query: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        user: {
            id: string;
            email: string;
            name: string;
        };
        package: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            features: import("@prisma/client/runtime/library").JsonValue;
            durationDays: number;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        gatewayTransactionId: string | null;
        userId: string;
        packageId: string | null;
        articleId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentGateway: string;
        invoiceUrl: string | null;
    }>>;
}
