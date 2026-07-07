import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { AdminPaymentQueryDto, InitiatePaymentDto, PaymentQueryDto } from './dto/payment.dto';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    initiatePayment(user: JwtPayload, dto: InitiatePaymentDto): Promise<{
        paymentId: string;
        checkoutUrl: string;
    }>;
    webhook(req: RawBodyRequest<Request>, signature: string): Promise<{
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
    mockComplete(providerTransactionId: string, status: 'COMPLETED' | 'FAILED'): Promise<{
        success: boolean;
        alreadyProcessed: boolean;
        status?: undefined;
    } | {
        success: boolean;
        status: string;
        alreadyProcessed?: undefined;
    }>;
    myPayments(user: JwtPayload, query: PaymentQueryDto): Promise<import("../common/dto/paginated-result.dto").PaginatedResult<any>>;
    adminGetAllPayments(query: AdminPaymentQueryDto): Promise<import("../common/dto/paginated-result.dto").PaginatedResult<any>>;
}
