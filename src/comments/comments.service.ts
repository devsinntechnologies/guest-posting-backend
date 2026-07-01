import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, ModerateCommentDto } from './dto/comments.dto';
import { PaginationDto, paginate, getSkip } from '../common/dto/pagination.dto';
import { CommentStatus } from '@prisma/client';
import { sanitizeContent } from '../common/utils/sanitize.util';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async findByArticle(articleId: string, query: PaginationDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = getSkip(page, limit);

    const where = {
      articleId,
      status: CommentStatus.APPROVED,
      deletedAt: null,
      parentCommentId: null,
    };

    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          replies: {
            where: { status: CommentStatus.APPROVED, deletedAt: null },
            include: {
              user: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.comment.count({ where }),
    ]);

    return paginate(items, total, page, limit);
  }

  async create(articleId: string, dto: CreateCommentDto, userId?: string) {
    const article = await this.prisma.article.findFirst({
      where: { id: articleId, deletedAt: null },
    });
    if (!article) throw new NotFoundException('Article not found');

    return this.prisma.comment.create({
      data: {
        articleId,
        userId,
        guestName: dto.guestName,
        guestEmail: dto.guestEmail,
        content: sanitizeContent(dto.content),
        parentCommentId: dto.parentCommentId,
        status: CommentStatus.PENDING,
      },
    });
  }

  async moderate(id: string, dto: ModerateCommentDto) {
    const comment = await this.prisma.comment.findFirst({
      where: { id, deletedAt: null },
    });
    if (!comment) throw new NotFoundException('Comment not found');

    return this.prisma.comment.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async softDelete(id: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id, deletedAt: null },
    });
    if (!comment) throw new NotFoundException('Comment not found');

    return this.prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
