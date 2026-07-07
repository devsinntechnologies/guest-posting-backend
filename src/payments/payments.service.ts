import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { PAYMENT_PROVIDER } from './interfaces/payment-provider.interface';
import type { PaymentProvider } from './interfaces/payment-provider.interface';
import {
  AdminPaymentQueryDto,
  InitiatePaymentDto,
  PaymentQueryDto,
} from './dto/payment.dto';
import {
  createPaginatedResult,
  PaginatedResult,
} from '../common/dto/paginated-result.dto';
import { getPrismaSkipTake } from '../common/utils/pagination.util';
import { NotificationType, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
  ) {}

  /**
   * Initiate a payment for a subscription plan.
   * Creates a PENDING payment record and returns checkout URL.
   */
  async initiatePayment(userId: string, dto: InitiatePaymentDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: dto.planId },
    });

    if (!plan || !plan.isActive) {
      throw new NotFoundException('Subscription plan not found or inactive.');
    }

    // Call payment provider checkout session creator
    const session = await this.provider.createCheckoutSession(
      userId,
      user.email,
      plan.id,
      Number(plan.price),
      plan.currency,
      plan.name,
    );

    // Create a PENDING payment record
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount: plan.price,
        currency: plan.currency,
        status: PaymentStatus.PENDING,
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

  /**
   * Complete payment processing (used by Webhook & Mock complete endpoints).
   * Idempotent logic.
   */
  async processPaymentCompletion(
    providerTransactionId: string,
    status: 'COMPLETED' | 'FAILED',
    providerMetadata?: any,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { providerTransactionId },
      include: { user: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found.');
    }

    // If payment is already resolved, return early (idempotent)
    if (payment.status !== PaymentStatus.PENDING) {
      return { success: true, alreadyProcessed: true };
    }

    const planId = (payment.providerMetadata as any)?.planId;
    if (!planId) {
      throw new BadRequestException('Plan ID missing from payment metadata.');
    }

    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) {
      throw new NotFoundException('Subscription plan not found.');
    }

    if (status === 'COMPLETED') {
      // Activate the subscription
      const subscription = await this.subscriptionsService.activateSubscription(
        payment.userId,
        plan.id,
        plan.durationDays,
      );

      // Update payment record
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          subscriptionId: subscription.id,
          providerMetadata: {
            ...(payment.providerMetadata as any),
            ...providerMetadata,
          },
        },
      });

      // Send a notification
      await this.prisma.notification.create({
        data: {
          userId: payment.userId,
          type: NotificationType.PAYMENT_CONFIRMED,
          title: 'Payment Confirmed',
          message: `Your payment of ${payment.amount} ${payment.currency} for plan "${plan.name}" was confirmed!`,
        },
      }).catch(() => {});

      return { success: true, status: 'COMPLETED' };
    } else {
      // Payment failed
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          providerMetadata: {
            ...(payment.providerMetadata as any),
            ...providerMetadata,
          },
        },
      });

      // Send notification
      await this.prisma.notification.create({
        data: {
          userId: payment.userId,
          type: NotificationType.PAYMENT_FAILED,
          title: 'Payment Failed',
          message: `Your payment of ${payment.amount} ${payment.currency} has failed.`,
        },
      }).catch(() => {});

      return { success: true, status: 'FAILED' };
    }
  }

  /**
   * Stripe Webhook Handler.
   */
  async handleWebhook(rawBody: Buffer, signature: string) {
    const result = await this.provider.verifyWebhook(rawBody, signature);
    if (!result) {
      return { received: true, processed: false };
    }

    const output = await this.processPaymentCompletion(
      result.providerTransactionId,
      result.status,
      result.rawMetadata,
    );

    return { received: true, ...output };
  }

  /**
   * Get authenticated user's payment history.
   */
  async getMyPayments(
    userId: string,
    query: PaymentQueryDto,
  ): Promise<PaginatedResult<any>> {
    const { page, limit, status } = query;
    const { skip, take } = getPrismaSkipTake(page, limit);

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

    return createPaginatedResult(items, total, page, limit);
  }

  /**
   * ADMIN: Get all payments across the platform.
   */
  async adminGetAllPayments(
    query: AdminPaymentQueryDto,
  ): Promise<PaginatedResult<any>> {
    const { page, limit, status, userId, providerTransactionId } = query;
    const { skip, take } = getPrismaSkipTake(page, limit);

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

    return createPaginatedResult(items, total, page, limit);
  }
}
