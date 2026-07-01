import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, ArticleStatus, OrderStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: string, role: UserRole) {
    if (role === UserRole.CONTRIBUTOR) {
      return this.getContributorStats(userId);
    }
    return this.getAdminStats();
  }

  private async getContributorStats(userId: string) {
    const [submissions, byStatus, orders] = await Promise.all([
      this.prisma.article.count({
        where: { authorId: userId, deletedAt: null },
      }),
      this.prisma.article.groupBy({
        by: ['status'],
        where: { authorId: userId, deletedAt: null },
        _count: true,
      }),
      this.prisma.order.count({
        where: { userId, status: OrderStatus.PAID },
      }),
    ]);

    return {
      totalSubmissions: submissions,
      submissionsByStatus: byStatus.reduce(
        (acc, item) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      paidOrders: orders,
    };
  }

  private async getAdminStats() {
    const [
      totalArticles,
      pendingReview,
      published,
      totalUsers,
      revenue,
      topArticles,
      recentSubmissions,
    ] = await Promise.all([
      this.prisma.article.count({ where: { deletedAt: null } }),
      this.prisma.article.count({
        where: { status: ArticleStatus.PENDING_REVIEW, deletedAt: null },
      }),
      this.prisma.article.count({
        where: { status: ArticleStatus.PUBLISHED, deletedAt: null },
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.order.aggregate({
        where: { status: OrderStatus.PAID },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED, deletedAt: null },
        orderBy: { viewCount: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          slug: true,
          viewCount: true,
          publishedAt: true,
        },
      }),
      this.prisma.article.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 86400000) },
          deletedAt: null,
        },
      }),
    ]);

    return {
      totalArticles,
      pendingReview,
      published,
      totalUsers,
      revenue: {
        total: revenue._sum.amount || 0,
        orderCount: revenue._count,
      },
      topArticles,
      submissionsLast30Days: recentSubmissions,
    };
  }
}
