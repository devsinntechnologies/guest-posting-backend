import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/payments.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
export declare class PaymentsService {
    private prisma;
    private config;
    private notifications;
    private email;
    private stripe;
    constructor(prisma: PrismaService, config: ConfigService, notifications: NotificationsService, email: EmailService);
    createCheckout(userId: string, dto: CheckoutDto): Promise<{
        orderId: string;
        checkoutUrl: string;
        message: string;
    } | {
        orderId: string;
        checkoutUrl: string | null;
        message?: undefined;
    }>;
    handleWebhook(payload: Buffer, signature: string): Promise<{
        received: boolean;
        duplicate: boolean;
    } | {
        received: boolean;
        duplicate?: undefined;
    }>;
    getMyOrders(userId: string, query: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
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
    getAllOrders(query: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
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
