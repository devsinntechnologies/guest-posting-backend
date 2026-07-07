import { Request } from 'express';

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
  /**
   * Create a checkout session (e.g. Stripe checkout URL)
   */
  createCheckoutSession(
    userId: string,
    email: string,
    planId: string,
    amount: number,
    currency: string,
    planName: string,
  ): Promise<CheckoutSessionResult>;

  /**
   * Verify a webhook event signature and extract transaction metadata
   */
  verifyWebhook(
    rawBody: Buffer,
    signature: string,
  ): Promise<WebhookVerificationResult | null>;
}

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');
