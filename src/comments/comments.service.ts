import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, CommentQueryDto } from './dto/comment.dto';
import { CommentStatus, ContentStatus } from '@prisma/client';
import {
  createPaginatedResult,
  PaginatedResult,
} from '../common/dto/paginated-result.dto';
import { getPrismaSkipTake } from '../common/utils/pagination.util';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a comment on a published content item.
   * Only active users (guarded in controller) on PUBLISHED content.
   */
  async create(contentId: string, userId: string, dto: CreateCommentDto) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, deletedAt: null },
    });

    if (!content) {
      throw new NotFoundException('Content not found.');
    }

    if (content.status !== ContentStatus.PUBLISHED) {
      throw new BadRequestException('You can only comment on published content.');
    }

    return this.prisma.comment.create({
      data: {
        contentId,
        userId,
        body: dto.body,
        status: CommentStatus.VISIBLE,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  /**
   * Get visible comments for a specific content item.
   */
  async findByContent(
    contentId: string,
    query: CommentQueryDto,
  ): Promise<PaginatedResult<any>> {
    const { page, limit } = query;
    const { skip, take } = getPrismaSkipTake(page, limit);

    const where = {
      contentId,
      status: CommentStatus.VISIBLE,
      deletedAt: null,
    };

    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.comment.count({ where }),
    ]);

    return createPaginatedResult(items, total, page, limit);
  }

  /**
   * ADMIN: Hide a comment.
   */
  async hide(id: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }

    return this.prisma.comment.update({
      where: { id },
      data: { status: CommentStatus.HIDDEN },
    });
  }

  /**
   * ADMIN: Hard delete a comment.
   */
  async delete(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }

    await this.prisma.comment.delete({
      where: { id },
    });

    return { message: 'Comment deleted successfully.' };
  }
}
