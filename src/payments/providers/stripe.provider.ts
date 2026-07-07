import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  PaymentProvider,
  CheckoutSessionResult,
  WebhookVerificationResult,
} from '../interfaces/payment-provider.interface';

@Injectable()
export class StripeProvider implements PaymentProvider {
  private readonly stripe: Stripe | null = null;
  private readonly webhookSecret: string | null = null;
  private readonly successUrl: string;
  private readonly cancelUrl: string;
  private readonly appUrl: string;
  private readonly logger = new Logger(StripeProvider.name);

  constructor(private readonly config: ConfigService) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    this.webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET') || null;
    this.successUrl = this.config.get<string>('STRIPE_SUCCESS_URL') || 'http://localhost:3000/payment/success';
    this.cancelUrl = this.config.get<string>('STRIPE_CANCEL_URL') || 'http://localhost:3000/payment/cancel';
    this.appUrl = this.config.get<string>('APP_BASE_URL') || 'http://localhost:3000';

    if (secretKey && secretKey !== 'sk_test_xxx') {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2026-06-24.dahlia',
      });
    } else {
      this.logger.warn(
        'Stripe secret key not provided or set to mock. Running in MOCK checkout mode.',
      );
    }
  }

  async createCheckoutSession(
    userId: string,
    email: string,
    planId: string,
    amount: number,
    currency: string,
    planName: string,
  ): Promise<CheckoutSessionResult> {
    if (!this.stripe) {
      // Mock flow
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
    } catch (error) {
      this.logger.error('Stripe session creation failed', error);
      throw new BadRequestException(`Stripe checkout error: ${error.message}`);
    }
  }

  async verifyWebhook(
    rawBody: Buffer,
    signature: string,
  ): Promise<WebhookVerificationResult | null> {
    if (!this.stripe) {
      // If we are in mock mode, we do not verify webhook via Stripe.
      return null;
    }

    if (!this.webhookSecret) {
      throw new BadRequestException('Stripe webhook secret is not configured.');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
    } catch (error) {
      this.logger.error('Webhook signature verification failed', error);
      throw new BadRequestException(`Invalid webhook signature: ${error.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

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
}
