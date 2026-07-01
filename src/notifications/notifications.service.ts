import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, UserRole } from '@prisma/client';
import { PaginationDto, paginate, getSkip } from '../common/dto/pagination.dto';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: PaginationDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = getSkip(page, limit);

    const where = { userId };

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return paginate(items, total, page, limit);
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        metadata: dto.metadata as object,
      },
    });
  }

  async notifySubmissionReceived(articleId: string, authorId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: { author: true },
    });
    if (!article) return;

    await this.create({
      userId: authorId,
      type: NotificationType.SUBMISSION_RECEIVED,
      title: 'Submission Received',
      message: `Your article "${article.title}" has been submitted for review.`,
      metadata: { articleId },
    });

    const editors = await this.prisma.user.findMany({
      where: {
        role: { in: [UserRole.EDITOR, UserRole.SUPER_ADMIN] },
        isActive: true,
        deletedAt: null,
      },
    });

    await Promise.all(
      editors.map((editor) =>
        this.create({
          userId: editor.id,
          type: NotificationType.SUBMISSION_RECEIVED,
          title: 'New Submission',
          message: `New article "${article.title}" submitted by ${article.author.name}.`,
          metadata: { articleId, authorId },
        }),
      ),
    );
  }
}
