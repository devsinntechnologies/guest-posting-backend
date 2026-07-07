import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminSubscriptionQueryDto,
  CreateSubscriptionPlanDto,
  SubscriptionPlanQueryDto,
  UpdateSubscriptionPlanDto,
} from './dto/subscription.dto';
import {
  createPaginatedResult,
  PaginatedResult,
} from '../common/dto/paginated-result.dto';
import { getPrismaSkipTake } from '../common/utils/pagination.util';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Plan Management ────────────────────────────────────────────────────────

  async createPlan(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    return this.prisma.subscriptionPlan.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        currency: dto.currency ?? 'USD',
        durationDays: dto.durationDays,
        features: dto.features,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updatePlan(
    id: string,
    dto: UpdateSubscriptionPlanDto,
  ): Promise<SubscriptionPlan> {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found.');
    }

    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.durationDays !== undefined && { durationDays: dto.durationDays }),
        ...(dto.features !== undefined && { features: dto.features }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async deletePlan(id: string): Promise<{ message: string }> {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
      include: { subscriptions: { take: 1 } },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found.');
    }

    if (plan.subscriptions.length > 0) {
      // If plan has subscriptions, soft delete it instead of hard delete
      await this.prisma.subscriptionPlan.update({
        where: { id },
        data: { isActive: false },
      });
      return { message: 'Plan deactivated because it has active subscriptions.' };
    }

    await this.prisma.subscriptionPlan.delete({
      where: { id },
    });
    return { message: 'Subscription plan deleted successfully.' };
  }

  async findAllPlans(query: SubscriptionPlanQueryDto): Promise<SubscriptionPlan[]> {
    return this.prisma.subscriptionPlan.findMany({
      where: {
        ...(query.isActive !== undefined && { isActive: query.isActive }),
      },
      orderBy: { price: 'asc' },
    });
  }

  async findPlanById(id: string): Promise<SubscriptionPlan> {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found.');
    }

    return plan;
  }

  // ─── Subscription Management ───────────────────────────────────────────────

  /**
   * Get own active subscription.
   */
  async getMyActiveSubscription(userId: string) {
    const now = new Date();
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: { plan: true },
    });
  }

  /**
   * ADMIN: List all subscriptions paginated.
   */
  async adminFindAllSubscriptions(
    query: AdminSubscriptionQueryDto,
  ): Promise<PaginatedResult<any>> {
    const { page, limit, userId, planId } = query;
    const { skip, take } = getPrismaSkipTake(page, limit);

    const where = {
      ...(userId && { userId }),
      ...(planId && { planId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          plan: { select: { id: true, name: true, price: true } },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return createPaginatedResult(items, total, page, limit);
  }

  /**
   * Internal/Helper: Create or extend active subscription for user.
   */
  async activateSubscription(
    userId: string,
    planId: string,
    durationDays: number,
  ) {
    const now = new Date();
    // Check if there is an existing active subscription
    const existing = await this.getMyActiveSubscription(userId);

    let startDate = now;
    let endDate = new Date();

    if (existing) {
      // Extend existing subscription
      startDate = existing.startDate;
      endDate = new Date(existing.endDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

      return this.prisma.subscription.update({
        where: { id: existing.id },
        data: {
          endDate,
          planId, // update to latest plan if upgraded/changed
        },
      });
    } else {
      // Create new subscription
      endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

      return this.prisma.subscription.create({
        data: {
          userId,
          planId,
          startDate,
          endDate,
          status: SubscriptionStatus.ACTIVE,
        },
      });
    }
  }
}
