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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
const email_service_1 = require("../email/email.service");
let PaymentsService = class PaymentsService {
    prisma;
    config;
    notifications;
    email;
    stripe;
    constructor(prisma, config, notifications, email) {
        this.prisma = prisma;
        this.config = config;
        this.notifications = notifications;
        this.email = email;
        const key = this.config.get('STRIPE_SECRET_KEY');
        if (key && key !== 'sk_test_xxx') {
            this.stripe = new stripe_1.default(key);
        }
    }
    async createCheckout(userId, dto) {
        const pkg = await this.prisma.package.findUnique({
            where: { id: dto.packageId },
        });
        if (!pkg || !pkg.isActive) {
            throw new common_1.NotFoundException('Package not found');
        }
        const order = await this.prisma.order.create({
            data: {
                userId,
                packageId: pkg.id,
                articleId: dto.articleId,
                amount: pkg.price,
                currency: pkg.currency,
                status: client_1.OrderStatus.PENDING,
            },
        });
        if (!this.stripe) {
            return {
                orderId: order.id,
                checkoutUrl: `${this.config.get('APP_URL')}/payment/mock?order=${order.id}`,
                message: 'Stripe not configured — mock checkout URL returned',
            };
        }
        const session = await this.stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: pkg.currency.toLowerCase(),
                        product_data: {
                            name: pkg.name,
                            description: pkg.description || undefined,
                        },
                        unit_amount: Math.round(Number(pkg.price) * 100),
                    },
                    quantity: 1,
                },
            ],
            success_url: `${this.config.get('STRIPE_SUCCESS_URL')}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: this.config.get('STRIPE_CANCEL_URL') || '',
            metadata: { orderId: order.id, userId },
        });
        return { orderId: order.id, checkoutUrl: session.url };
    }
    async handleWebhook(payload, signature) {
        const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
        if (!this.stripe || !webhookSecret || webhookSecret === 'whsec_xxx') {
            throw new common_1.BadRequestException('Stripe webhook not configured');
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        }
        catch {
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const transactionId = session.id;
            const existing = await this.prisma.order.findUnique({
                where: { gatewayTransactionId: transactionId },
            });
            if (existing?.status === client_1.OrderStatus.PAID) {
                return { received: true, duplicate: true };
            }
            const orderId = session.metadata?.orderId;
            if (!orderId)
                throw new common_1.BadRequestException('Missing order metadata');
            const order = await this.prisma.order.update({
                where: { id: orderId },
                data: {
                    status: client_1.OrderStatus.PAID,
                    gatewayTransactionId: transactionId,
                    invoiceUrl: typeof session.invoice === 'string' ? session.invoice : null,
                },
                include: { user: true },
            });
            await this.notifications.create({
                userId: order.userId,
                type: client_1.NotificationType.PAYMENT_CONFIRMED,
                title: 'Payment Confirmed',
                message: `Your payment of ${String(order.amount)} ${order.currency} was confirmed.`,
                metadata: { orderId: order.id },
            });
            await this.email.queueEmail(order.user.email, 'payment_confirmed', 'Payment Confirmed', {
                name: order.user.name,
                amount: String(order.amount),
                currency: order.currency,
            });
        }
        return { received: true };
    }
    async getMyOrders(userId, query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (0, pagination_dto_1.getSkip)(page, limit);
        const where = { userId };
        const [items, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                include: {
                    package: true,
                    article: { select: { id: true, title: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.order.count({ where }),
        ]);
        return (0, pagination_dto_1.paginate)(items, total, page, limit);
    }
    async getAllOrders(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (0, pagination_dto_1.getSkip)(page, limit);
        const [items, total] = await Promise.all([
            this.prisma.order.findMany({
                skip,
                take: limit,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    package: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.order.count(),
        ]);
        return (0, pagination_dto_1.paginate)(items, total, page, limit);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        notifications_service_1.NotificationsService,
        email_service_1.EmailService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map