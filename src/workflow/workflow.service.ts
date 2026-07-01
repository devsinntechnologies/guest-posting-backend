import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ArticleStatus, UserRole } from '@prisma/client';
import { assertValidTransition } from './workflow.state-machine';

export interface TransitionDto {
  articleId: string;
  toStatus: ArticleStatus;
  actorId: string;
  actorRole: UserRole;
  note?: string;
  rejectionReason?: string;
  categoryId?: string;
}

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) {}

  async transition(dto: TransitionDto) {
    const article = await this.prisma.article.findFirst({
      where: { id: dto.articleId, deletedAt: null },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    assertValidTransition(article.status, dto.toStatus);

    if (dto.toStatus === ArticleStatus.REJECTED && !dto.rejectionReason) {
      throw new Error('Rejection reason is required');
    }

    if (
      dto.toStatus === ArticleStatus.APPROVED &&
      !article.categoryId &&
      !dto.categoryId
    ) {
      throw new Error('Category must be assigned before approval');
    }

    const updateData: Record<string, unknown> = {
      status: dto.toStatus,
    };

    if (dto.rejectionReason) {
      updateData.rejectionReason = dto.rejectionReason;
    }

    if (dto.categoryId) {
      updateData.categoryId = dto.categoryId;
    }

    if (dto.toStatus === ArticleStatus.PUBLISHED) {
      updateData.publishedAt = new Date();
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.article.update({
        where: { id: dto.articleId },
        data: updateData,
        include: {
          author: { select: { id: true, name: true, email: true } },
          category: true,
        },
      }),
      this.prisma.submissionLog.create({
        data: {
          articleId: dto.articleId,
          actorId: dto.actorId,
          fromStatus: article.status,
          toStatus: dto.toStatus,
          note: dto.note || dto.rejectionReason,
        },
      }),
    ]);

    return updated;
  }

  async getHistory(articleId: string) {
    return this.prisma.submissionLog.findMany({
      where: { articleId },
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
