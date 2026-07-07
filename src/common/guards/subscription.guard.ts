import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../decorators/current-user.decorator';
import { Request } from 'express';
import { SubscriptionStatus } from '@prisma/client';

/**
 * Guards routes that require an active subscription.
 * Must be used after JwtAuthGuard (user must be authenticated first).
 *
 * Apply with: @UseGuards(SubscriptionGuard)
 *
 * ADMIN users bypass this guard entirely.
 */
@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // ADMIN bypasses subscription check
    if (user.role === 'ADMIN') return true;

    const now = new Date();

    const activeSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId: user.sub,
        status: SubscriptionStatus.ACTIVE,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (!activeSubscription) {
      throw new ForbiddenException(
        'An active subscription is required to perform this action. Please purchase a subscription plan.',
      );
    }

    return true;
  }
}
