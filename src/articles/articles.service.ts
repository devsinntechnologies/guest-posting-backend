import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateArticleDto,
  UpdateArticleDto,
  UpdateArticleStatusDto,
  ArticleQueryDto,
} from './dto/articles.dto';
import { paginate, getSkip } from '../common/dto/pagination.dto';
import { generateSlug, ensureUniqueSlug } from '../common/utils/slug.util';
import {
  sanitizeContent,
  calculateReadingTime,
} from '../common/utils/sanitize.util';
import {
  ArticleStatus,
  UserRole,
  NotificationType,
  Prisma,
} from '@prisma/client';

@Injectable()
export class ArticlesService {
  constructor(
    private prisma: PrismaService,
    private workflow: WorkflowService,
    private notifications: NotificationsService,
  ) {}

  async findAll(query: ArticleQueryDto, userRole?: UserRole) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = getSkip(page, limit);

    const where: Prisma.ArticleWhereInput = {
      deletedAt: null,
      ...(userRole === UserRole.CONTRIBUTOR || !userRole
        ? { status: ArticleStatus.PUBLISHED }
        : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.tag
        ? { articleTags: { some: { tag: { slug: query.tag } } } }
        : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { excerpt: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.ArticleOrderByWithRelationInput = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
          articleTags: { include: { tag: true } },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return paginate(items, total, page, limit);
  }

  async findBySlug(slug: string) {
    const article = await this.prisma.article.findFirst({
      where: { slug, deletedAt: null, status: ArticleStatus.PUBLISHED },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        category: true,
        articleTags: { include: { tag: true } },
      },
    });

    if (!article) throw new NotFoundException('Article not found');

    await this.prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return article;
  }

  async findById(id: string) {
    const article = await this.prisma.article.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        articleTags: { include: { tag: true } },
      },
    });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async mySubmissions(userId: string, query: ArticleQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = getSkip(page, limit);

    const where: Prisma.ArticleWhereInput = {
      authorId: userId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return paginate(items, total, page, limit);
  }

  async create(dto: CreateArticleDto, authorId: string) {
    const baseSlug = generateSlug(dto.title);
    const slug = await ensureUniqueSlug(baseSlug, async (s) => {
      const existing = await this.prisma.article.findUnique({
        where: { slug: s },
      });
      return !!existing;
    });

    const content = sanitizeContent(dto.content);
    const status = dto.submit
      ? ArticleStatus.PENDING_REVIEW
      : ArticleStatus.DRAFT;

    const article = await this.prisma.article.create({
      data: {
        title: dto.title,
        slug,
        content,
        excerpt: dto.excerpt,
        featuredImageUrl: dto.featuredImageUrl,
        authorId,
        categoryId: dto.categoryId,
        status,
        targetUrl: dto.targetUrl,
        anchorText: dto.anchorText,
        metaTitle: dto.metaTitle || dto.title,
        metaDescription: dto.metaDescription || dto.excerpt,
        metaKeywords: dto.metaKeywords,
        readingTimeMinutes: calculateReadingTime(content),
        ...(dto.tagIds?.length
          ? {
              articleTags: {
                create: dto.tagIds.map((tagId) => ({ tagId })),
              },
            }
          : {}),
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        articleTags: { include: { tag: true } },
      },
    });

    if (status === ArticleStatus.PENDING_REVIEW) {
      await this.onSubmit(article.id, authorId);
    }

    return article;
  }

  async update(
    id: string,
    dto: UpdateArticleDto,
    userId: string,
    userRole: UserRole,
  ) {
    const article = await this.findById(id);
    this.assertCanEdit(article, userId, userRole);

    const data: Prisma.ArticleUpdateInput = {};

    if (dto.title) {
      data.title = dto.title;
      const baseSlug = generateSlug(dto.title);
      data.slug = await ensureUniqueSlug(
        baseSlug,
        async (s) => {
          const existing = await this.prisma.article.findUnique({
            where: { slug: s },
          });
          return !!existing && existing.id !== id;
        },
        article.slug,
      );
    }

    if (dto.content) {
      data.content = sanitizeContent(dto.content);
      data.readingTimeMinutes = calculateReadingTime(dto.content);
    }

    if (dto.excerpt !== undefined) data.excerpt = dto.excerpt;
    if (dto.featuredImageUrl !== undefined)
      data.featuredImageUrl = dto.featuredImageUrl;
    if (dto.categoryId !== undefined)
      data.category = { connect: { id: dto.categoryId } };
    if (dto.targetUrl !== undefined) data.targetUrl = dto.targetUrl;
    if (dto.anchorText !== undefined) data.anchorText = dto.anchorText;
    if (dto.metaTitle !== undefined) data.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined)
      data.metaDescription = dto.metaDescription;
    if (dto.metaKeywords !== undefined) data.metaKeywords = dto.metaKeywords;

    if (dto.tagIds) {
      await this.prisma.articleTag.deleteMany({ where: { articleId: id } });
      data.articleTags = {
        create: dto.tagIds.map((tagId) => ({ tagId })),
      };
    }

    return this.prisma.article.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true } },
        category: true,
        articleTags: { include: { tag: true } },
      },
    });
  }

  async updateStatus(
    id: string,
    dto: UpdateArticleStatusDto,
    actorId: string,
    actorRole: UserRole,
  ) {
    if (
      actorRole === UserRole.CONTRIBUTOR &&
      dto.status === ArticleStatus.PENDING_REVIEW
    ) {
      const article = await this.findById(id);
      if (article.authorId !== actorId) {
        throw new ForbiddenException("Cannot submit another user's article");
      }
    } else if (actorRole === UserRole.CONTRIBUTOR) {
      throw new ForbiddenException('Contributors cannot change article status');
    }

    const updated = await this.workflow.transition({
      articleId: id,
      toStatus: dto.status,
      actorId,
      actorRole,
      note: dto.note,
      rejectionReason: dto.rejectionReason,
      categoryId: dto.categoryId,
    });

    await this.onStatusChange(updated, dto.status);

    return updated;
  }

  async softDelete(id: string, userId: string, userRole: UserRole) {
    const article = await this.findById(id);
    if (userRole === UserRole.CONTRIBUTOR && article.authorId !== userId) {
      throw new ForbiddenException("Cannot delete another user's article");
    }

    return this.prisma.article.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private assertCanEdit(
    article: { authorId: string; status: ArticleStatus },
    userId: string,
    userRole: UserRole,
  ) {
    if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.EDITOR) {
      return;
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own articles');
    }

    const editableStatuses: ArticleStatus[] = [
      ArticleStatus.DRAFT,
      ArticleStatus.PENDING_REVIEW,
      ArticleStatus.REJECTED,
    ];

    if (!editableStatuses.includes(article.status)) {
      throw new BadRequestException('Cannot edit article in current status');
    }
  }

  private async onSubmit(articleId: string, authorId: string) {
    await this.prisma.submissionLog.create({
      data: {
        articleId,
        actorId: authorId,
        fromStatus: ArticleStatus.DRAFT,
        toStatus: ArticleStatus.PENDING_REVIEW,
        note: 'Article submitted for review',
      },
    });

    await this.notifications.notifySubmissionReceived(articleId, authorId);
  }

  private async onStatusChange(
    article: { id: string; title: string; authorId: string; slug: string },
    status: ArticleStatus,
  ) {
    if (status === ArticleStatus.REJECTED) {
      await this.notifications.create({
        userId: article.authorId,
        type: NotificationType.ARTICLE_REJECTED,
        title: 'Article Rejected',
        message: `Your article "${article.title}" was rejected.`,
        metadata: { articleId: article.id },
      });
    }

    if (status === ArticleStatus.PUBLISHED) {
      await this.notifications.create({
        userId: article.authorId,
        type: NotificationType.ARTICLE_PUBLISHED,
        title: 'Article Published',
        message: `Your article "${article.title}" is now live!`,
        metadata: { articleId: article.id, slug: article.slug },
      });
    }

    if (
      status === ArticleStatus.APPROVED ||
      status === ArticleStatus.REJECTED
    ) {
      await this.notifications.create({
        userId: article.authorId,
        type: NotificationType.STATUS_CHANGED,
        title: 'Article Status Updated',
        message: `Your article "${article.title}" status changed to ${status}.`,
        metadata: { articleId: article.id, status },
      });
    }
  }
}
