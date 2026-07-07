import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import type { PaymentProvider } from './interfaces/payment-provider.interface';
import { AdminPaymentQueryDto, InitiatePaymentDto, PaymentQueryDto } from './dto/payment.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
export declare class PaymentsService {
    private readonly prisma;
    private readonly subscriptionsService;
    private readonly provider;
    constructor(prisma: PrismaService, subscriptionsService: SubscriptionsService, provider: PaymentProvider);
    initiatePayment(userId: string, dto: InitiatePaymentDto): Promise<{
        paymentId: string;
        checkoutUrl: string;
    }>;
    processPaymentCompletion(providerTransactionId: string, status: 'COMPLETED' | 'FAILED', providerMetadata?: any): Promise<{
        success: boolean;
        alreadyProcessed: boolean;
        status?: undefined;
    } | {
        success: boolean;
        status: string;
        alreadyProcessed?: undefined;
    }>;
    handleWebhook(rawBody: Buffer, signature: string): Promise<{
        received: boolean;
        processed: boolean;
    } | {
        success: boolean;
        alreadyProcessed: boolean;
        status?: undefined;
        received: boolean;
        processed?: undefined;
    } | {
        success: boolean;
        status: string;
        alreadyProcessed?: undefined;
        received: boolean;
        processed?: undefined;
    }>;
    getMyPayments(userId: string, query: PaymentQueryDto): Promise<PaginatedResult<any>>;
    adminGetAllPayments(query: AdminPaymentQueryDto): Promise<PaginatedResult<any>>;
}
