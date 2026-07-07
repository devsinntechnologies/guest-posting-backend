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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
const payment_provider_interface_1 = require("./interfaces/payment-provider.interface");
const paginated_result_dto_1 = require("../common/dto/paginated-result.dto");
const pagination_util_1 = require("../common/utils/pagination.util");
const client_1 = require("@prisma/client");
let PaymentsService = class PaymentsService {
    prisma;
    subscriptionsService;
    provider;
    constructor(prisma, subscriptionsService, provider) {
        this.prisma = prisma;
        this.subscriptionsService = subscriptionsService;
        this.provider = provider;
    }
    async initiatePayment(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found.');
        }
        const plan = await this.prisma.subscriptionPlan.findUnique({
            where: { id: dto.planId },
        });
        if (!plan || !plan.isActive) {
            throw new common_1.NotFoundException('Subscription plan not found or inactive.');
        }
        const session = await this.provider.createCheckoutSession(userId, user.email, plan.id, Number(plan.price), plan.currency, plan.name);
        const payment = await this.prisma.payment.create({
            data: {
                userId,
                amount: plan.price,
                currency: plan.currency,
                status: client_1.PaymentStatus.PENDING,
                provider: 'stripe',
                providerTransactionId: session.providerTransactionId,
                providerMetadata: {
                    planId: plan.id,
                },
            },
        });
        return {
            paymentId: payment.id,
            checkoutUrl: session.checkoutUrl,
        };
    }
    async processPaymentCompletion(providerTransactionId, status, providerMetadata) {
        const payment = await this.prisma.payment.findUnique({
            where: { providerTransactionId },
            include: { user: true },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment record not found.');
        }
        if (payment.status !== client_1.PaymentStatus.PENDING) {
            return { success: true, alreadyProcessed: true };
        }
        const planId = payment.providerMetadata?.planId;
        if (!planId) {
            throw new common_1.BadRequestException('Plan ID missing from payment metadata.');
        }
        const plan = await this.prisma.subscriptionPlan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Subscription plan not found.');
        }
        if (status === 'COMPLETED') {
            const subscription = await this.subscriptionsService.activateSubscription(payment.userId, plan.id, plan.durationDays);
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: client_1.PaymentStatus.COMPLETED,
                    subscriptionId: subscription.id,
                    providerMetadata: {
                        ...payment.providerMetadata,
                        ...providerMetadata,
                    },
                },
            });
            await this.prisma.notification.create({
                data: {
                    userId: payment.userId,
                    type: client_1.NotificationType.PAYMENT_CONFIRMED,
                    title: 'Payment Confirmed',
                    message: `Your payment of ${payment.amount} ${payment.currency} for plan "${plan.name}" was confirmed!`,
                },
            }).catch(() => { });
            return { success: true, status: 'COMPLETED' };
        }
        else {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: client_1.PaymentStatus.FAILED,
                    providerMetadata: {
                        ...payment.providerMetadata,
                        ...providerMetadata,
                    },
                },
            });
            await this.prisma.notification.create({
                data: {
                    userId: payment.userId,
                    type: client_1.NotificationType.PAYMENT_FAILED,
                    title: 'Payment Failed',
                    message: `Your payment of ${payment.amount} ${payment.currency} has failed.`,
                },
            }).catch(() => { });
            return { success: true, status: 'FAILED' };
        }
    }
    async handleWebhook(rawBody, signature) {
        const result = await this.provider.verifyWebhook(rawBody, signature);
        if (!result) {
            return { received: true, processed: false };
        }
        const output = await this.processPaymentCompletion(result.providerTransactionId, result.status, result.rawMetadata);
        return { received: true, ...output };
    }
    async getMyPayments(userId, query) {
        const { page, limit, status } = query;
        const { skip, take } = (0, pagination_util_1.getPrismaSkipTake)(page, limit);
        const where = {
            userId,
            ...(status && { status }),
        };
        const [items, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                include: {
                    subscription: {
                        include: { plan: { select: { name: true } } },
                    },
                },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.payment.count({ where }),
        ]);
        return (0, paginated_result_dto_1.createPaginatedResult)(items, total, page, limit);
    }
    async adminGetAllPayments(query) {
        const { page, limit, status, userId, providerTransactionId } = query;
        const { skip, take } = (0, pagination_util_1.getPrismaSkipTake)(page, limit);
        const where = {
            ...(status && { status }),
            ...(userId && { userId }),
            ...(providerTransactionId && { providerTransactionId }),
        };
        const [items, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    subscription: {
                        include: { plan: { select: { name: true } } },
                    },
                },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.payment.count({ where }),
        ]);
        return (0, paginated_result_dto_1.createPaginatedResult)(items, total, page, limit);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(payment_provider_interface_1.PAYMENT_PROVIDER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        subscriptions_service_1.SubscriptionsService, Object])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map