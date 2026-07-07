import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewActionDto, ReviewQueueQueryDto } from './dto/review.dto';
import {
  ContentStatus,
  NotificationType,
  ReviewAction,
} from '@prisma/client';
import {
  createPaginatedResult,
  PaginatedResult,
} from '../common/dto/paginated-result.dto';
import { getPrismaSkipTake } from '../common/utils/pagination.util';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ADMIN: Get content items pending review.
   */
  async getQueue(query: ReviewQueueQueryDto): Promise<PaginatedResult<any>> {
    const { page, limit, search, contentType } = query;
    const { skip, take } = getPrismaSkipTake(page, limit);

    const where = {
      status: ContentStatus.PENDING_REVIEW,
      deletedAt: null,
      ...(search && {
        title: { contains: search, mode: 'insensitive' as const },
      }),
      ...(contentType && { contentType }),
    };

    const [items, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true } },
        },
        skip,
        take,
        orderBy: { updatedAt: 'asc' }, // Oldest pending first
      }),
      this.prisma.content.count({ where }),
    ]);

    return createPaginatedResult(items, total, page, limit);
  }

  /**
   * ADMIN: Approve content draft (Pending -> Approved).
   */
  async approve(contentId: string, actorId: string, dto: ReviewActionDto) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, deletedAt: null },
    });

    if (!content) throw new NotFoundException('Content not found.');

    if (content.status !== ContentStatus.PENDING_REVIEW) {
      throw new BadRequestException(
        `Cannot approve content with status ${content.status}. Must be PENDING_REVIEW.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.content.update({
        where: { id: contentId },
        data: { status: ContentStatus.APPROVED },
      });

      await tx.reviewEvent.create({
        data: {
          contentId,
          actorId,
          action: ReviewAction.APPROVED,
          fromStatus: ContentStatus.PENDING_REVIEW,
          toStatus: ContentStatus.APPROVED,
          note: dto.note,
        },
      });

      await tx.notification.create({
        data: {
          userId: content.authorId,
          type: NotificationType.CONTENT_APPROVED,
          title: 'Content Approved',
          message: `Your content "${content.title}" has been approved! It is ready for publication.`,
        },
      });

      return updated;
    });
  }

  /**
   * ADMIN: Publish content draft (Approved or Pending -> Published).
   */
  async publish(contentId: string, actorId: string, dto: ReviewActionDto) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, deletedAt: null },
    });

    if (!content) throw new NotFoundException('Content not found.');

    const allowed: ContentStatus[] = [
      ContentStatus.PENDING_REVIEW,
      ContentStatus.APPROVED,
      ContentStatus.UNPUBLISHED,
    ];

    if (!allowed.includes(content.status)) {
      throw new BadRequestException(
        `Cannot publish content with status ${content.status}.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.content.update({
        where: { id: contentId },
        data: {
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });

      await tx.reviewEvent.create({
        data: {
          contentId,
          actorId,
          action: ReviewAction.PUBLISHED,
          fromStatus: content.status,
          toStatus: ContentStatus.PUBLISHED,
          note: dto.note,
        },
      });

      await tx.notification.create({
        data: {
          userId: content.authorId,
          type: NotificationType.CONTENT_PUBLISHED,
          title: 'Content Published',
          message: `Your content "${content.title}" is now LIVE!`,
        },
      });

      return updated;
    });
  }

  /**
   * ADMIN: Reject content draft (Pending -> Rejected).
   */
  async reject(contentId: string, actorId: string, dto: ReviewActionDto) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, deletedAt: null },
    });

    if (!content) throw new NotFoundException('Content not found.');

    if (content.status !== ContentStatus.PENDING_REVIEW) {
      throw new BadRequestException(
        `Cannot reject content with status ${content.status}.`,
      );
    }

    if (!dto.note || dto.note.trim() === '') {
      throw new BadRequestException(
        'A reason note is required when rejecting content.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.content.update({
        where: { id: contentId },
        data: { status: ContentStatus.REJECTED },
      });

      await tx.reviewEvent.create({
        data: {
          contentId,
          actorId,
          action: ReviewAction.REJECTED,
          fromStatus: ContentStatus.PENDING_REVIEW,
          toStatus: ContentStatus.REJECTED,
          note: dto.note,
        },
      });

      await tx.notification.create({
        data: {
          userId: content.authorId,
          type: NotificationType.CONTENT_REJECTED,
          title: 'Content Rejected',
          message: `Your content "${content.title}" has been rejected. Reason: ${dto.note}`,
        },
      });

      return updated;
    });
  }

  /**
   * ADMIN: Request changes (Pending -> Changes Requested).
   */
  async requestChanges(
    contentId: string,
    actorId: string,
    dto: ReviewActionDto,
  ) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, deletedAt: null },
    });

    if (!content) throw new NotFoundException('Content not found.');

    if (content.status !== ContentStatus.PENDING_REVIEW) {
      throw new BadRequestException(
        `Cannot request changes for content with status ${content.status}.`,
      );
    }

    if (!dto.note || dto.note.trim() === '') {
      throw new BadRequestException(
        'A reason note is required when requesting changes.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.content.update({
        where: { id: contentId },
        data: { status: ContentStatus.CHANGES_REQUESTED },
      });

      await tx.reviewEvent.create({
        data: {
          contentId,
          actorId,
          action: ReviewAction.CHANGES_REQUESTED,
          fromStatus: ContentStatus.PENDING_REVIEW,
          toStatus: ContentStatus.CHANGES_REQUESTED,
          note: dto.note,
        },
      });

      await tx.notification.create({
        data: {
          userId: content.authorId,
          type: NotificationType.CONTENT_CHANGES_REQUESTED,
          title: 'Changes Requested',
          message: `Changes were requested on your content "${content.title}". Note: ${dto.note}`,
        },
      });

      return updated;
    });
  }

  /**
   * ADMIN: Unpublish content (Published -> Unpublished).
   */
  async unpublish(contentId: string, actorId: string, dto: ReviewActionDto) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, deletedAt: null },
    });

    if (!content) throw new NotFoundException('Content not found.');

    if (content.status !== ContentStatus.PUBLISHED) {
      throw new BadRequestException(
        `Cannot unpublish content with status ${content.status}. Must be PUBLISHED.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.content.update({
        where: { id: contentId },
        data: { status: ContentStatus.UNPUBLISHED },
      });

      await tx.reviewEvent.create({
        data: {
          contentId,
          actorId,
          action: ReviewAction.UNPUBLISHED,
          fromStatus: ContentStatus.PUBLISHED,
          toStatus: ContentStatus.UNPUBLISHED,
          note: dto.note,
        },
      });

      await tx.notification.create({
        data: {
          userId: content.authorId,
          type: NotificationType.CONTENT_UNPUBLISHED,
          title: 'Content Unpublished',
          message: `Your content "${content.title}" was unpublished.`,
        },
      });

      return updated;
    });
  }
}
