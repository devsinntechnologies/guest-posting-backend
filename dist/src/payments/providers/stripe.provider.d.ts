import { ConfigService } from '@nestjs/config';
import { PaymentProvider, CheckoutSessionResult, WebhookVerificationResult } from '../interfaces/payment-provider.interface';
export declare class StripeProvider implements PaymentProvider {
    private readonly config;
    private readonly stripe;
    private readonly webhookSecret;
    private readonly successUrl;
    private readonly cancelUrl;
    private readonly appUrl;
    private readonly logger;
    constructor(config: ConfigService);
    createCheckoutSession(userId: string, email: string, planId: string, amount: number, currency: string, planName: string): Promise<CheckoutSessionResult>;
    verifyWebhook(rawBody: Buffer, signature: string): Promise<WebhookVerificationResult | null>;
}
