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
var StripeProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
let StripeProvider = StripeProvider_1 = class StripeProvider {
    config;
    stripe = null;
    webhookSecret = null;
    successUrl;
    cancelUrl;
    appUrl;
    logger = new common_1.Logger(StripeProvider_1.name);
    constructor(config) {
        this.config = config;
        const secretKey = this.config.get('STRIPE_SECRET_KEY');
        this.webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET') || null;
        this.successUrl = this.config.get('STRIPE_SUCCESS_URL') || 'http://localhost:3000/payment/success';
        this.cancelUrl = this.config.get('STRIPE_CANCEL_URL') || 'http://localhost:3000/payment/cancel';
        this.appUrl = this.config.get('APP_BASE_URL') || 'http://localhost:3000';
        if (secretKey && secretKey !== 'sk_test_xxx') {
            this.stripe = new stripe_1.default(secretKey, {
                apiVersion: '2026-06-24.dahlia',
            });
        }
        else {
            this.logger.warn('Stripe secret key not provided or set to mock. Running in MOCK checkout mode.');
        }
    }
    async createCheckoutSession(userId, email, planId, amount, currency, planName) {
        if (!this.stripe) {
            const mockSessionId = `mock_session_${Math.random().toString(36).substr(2, 9)}`;
            const checkoutUrl = `${this.appUrl}/payments/mock-checkout?sessionId=${mockSessionId}&userId=${userId}&planId=${planId}&amount=${amount}&currency=${currency}`;
            return {
                providerTransactionId: mockSessionId,
                checkoutUrl,
            };
        }
        try {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: currency.toLowerCase(),
                            product_data: {
                                name: planName,
                                description: `Subscription plan: ${planName}`,
                            },
                            unit_amount: Math.round(amount * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${this.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: this.cancelUrl,
                customer_email: email,
                metadata: {
                    userId,
                    planId,
                },
            });
            return {
                providerTransactionId: session.id,
                checkoutUrl: session.url || '',
            };
        }
        catch (error) {
            this.logger.error('Stripe session creation failed', error);
            throw new common_1.BadRequestException(`Stripe checkout error: ${error.message}`);
        }
    }
    async verifyWebhook(rawBody, signature) {
        if (!this.stripe) {
            return null;
        }
        if (!this.webhookSecret) {
            throw new common_1.BadRequestException('Stripe webhook secret is not configured.');
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
        }
        catch (error) {
            this.logger.error('Webhook signature verification failed', error);
            throw new common_1.BadRequestException(`Invalid webhook signature: ${error.message}`);
        }
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata?.userId;
            const planId = session.metadata?.planId;
            const amount = session.amount_total ? session.amount_total / 100 : 0;
            const currency = session.currency ? session.currency.toUpperCase() : 'USD';
            if (!userId || !planId) {
                this.logger.warn('Stripe checkout session missing metadata.');
                return null;
            }
            return {
                providerTransactionId: session.id,
                userId,
                planId,
                amount,
                currency,
                status: session.payment_status === 'paid' ? 'COMPLETED' : 'FAILED',
                rawMetadata: session,
            };
        }
        return null;
    }
};
exports.StripeProvider = StripeProvider;
exports.StripeProvider = StripeProvider = StripeProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StripeProvider);
//# sourceMappingURL=stripe.provider.js.map