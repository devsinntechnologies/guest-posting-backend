import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/payments.dto';
import { PaginationDto, paginate, getSkip } from '../common/dto/pagination.dto';
import { OrderStatus, NotificationType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private notifications: NotificationsService,
    private email: EmailService,
  ) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    if (key && key !== 'sk_test_xxx') {
      this.stripe = new Stripe(key);
    }
  }

  async createCheckout(userId: string, dto: CheckoutDto) {
    const pkg = await this.prisma.package.findUnique({
      where: { id: dto.packageId },
    });
    if (!pkg || !pkg.isActive) {
      throw new NotFoundException('Package not found');
    }

    const order = await this.prisma.order.create({
      data: {
        userId,
        packageId: pkg.id,
        articleId: dto.articleId,
        amount: pkg.price,
        currency: pkg.currency,
        status: OrderStatus.PENDING,
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

  /** Idempotent webhook handler — processes each gatewayTransactionId once. */
  async handleWebhook(payload: Buffer, signature: string) {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!this.stripe || !webhookSecret || webhookSecret === 'whsec_xxx') {
      throw new BadRequestException('Stripe webhook not configured');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const transactionId = session.id;

      const existing = await this.prisma.order.findUnique({
        where: { gatewayTransactionId: transactionId },
      });
      if (existing?.status === OrderStatus.PAID) {
        return { received: true, duplicate: true };
      }

      const orderId = session.metadata?.orderId;
      if (!orderId) throw new BadRequestException('Missing order metadata');

      const order = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PAID,
          gatewayTransactionId: transactionId,
          invoiceUrl:
            typeof session.invoice === 'string' ? session.invoice : null,
        },
        include: { user: true },
      });

      await this.notifications.create({
        userId: order.userId,
        type: NotificationType.PAYMENT_CONFIRMED,
        title: 'Payment Confirmed',
        message: `Your payment of ${String(order.amount)} ${order.currency} was confirmed.`,
        metadata: { orderId: order.id },
      });

      await this.email.queueEmail(
        order.user.email,
        'payment_confirmed',
        'Payment Confirmed',
        {
          name: order.user.name,
          amount: String(order.amount),
          currency: order.currency,
        },
      );
    }

    return { received: true };
  }

  async getMyOrders(userId: string, query: PaginationDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = getSkip(page, limit);

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

    return paginate(items, total, page, limit);
  }

  async getAllOrders(query: PaginationDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = getSkip(page, limit);

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

    return paginate(items, total, page, limit);
  }
}
