export interface CheckoutSessionResult {
    providerTransactionId: string;
    checkoutUrl: string;
}
export interface WebhookVerificationResult {
    providerTransactionId: string;
    userId: string;
    planId: string;
    amount: number;
    currency: string;
    status: 'COMPLETED' | 'FAILED';
    rawMetadata?: any;
}
export interface PaymentProvider {
    createCheckoutSession(userId: string, email: string, planId: string, amount: number, currency: string, planName: string): Promise<CheckoutSessionResult>;
    verifyWebhook(rawBody: Buffer, signature: string): Promise<WebhookVerificationResult | null>;
}
export declare const PAYMENT_PROVIDER: unique symbol;
