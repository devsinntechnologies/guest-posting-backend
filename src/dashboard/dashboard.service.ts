import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContentStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ADMIN: Get aggregate statistics of the platform.
   */
  async getAdminStats() {
    const [
      publishedContent,
      pendingReviewContent,
      totalUsers,
      totalSubscriptions,
      completedPayments,
      totalComments,
    ] = await Promise.all([
      // Published Content
      this.prisma.content.count({
        where: { status: ContentStatus.PUBLISHED, deletedAt: null },
      }),
      // Pending Review Content
      this.prisma.content.count({
        where: { status: ContentStatus.PENDING_REVIEW, deletedAt: null },
      }),
      // Active Users
      this.prisma.user.count({
        where: { isActive: true, deletedAt: null },
      }),
      // Total active subscriptions
      this.prisma.subscription.count(),
      // Revenue aggregate
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
        _count: true,
      }),
      // Comments
      this.prisma.comment.count({
        where: { deletedAt: null },
      }),
    ]);

    return {
      publishedContent,
      pendingReviewContent,
      totalUsers,
      totalSubscriptions,
      revenue: {
        totalAmount: completedPayments._sum.amount || 0,
        completedCount: completedPayments._count,
      },
      totalComments,
    };
  }

  /**
   * ADMIN: Get recent activity logs (e.g., review events).
   */
  async getRecentActivity(limit = 15) {
    return this.prisma.reviewEvent.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, name: true, role: true } },
        content: { select: { id: true, title: true, slug: true } },
      },
    });
  }
}
