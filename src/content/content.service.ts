import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ContentStatus,
  ContentType,
  ReviewAction,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminContentQueryDto,
  ContentQueryDto,
  CreateContentDto,
  ReviewActionDto,
  SubmitContentDto,
  UpdateContentDto,
} from './dto/content.dto';
import { generateSlug, generateUniqueSlug } from '../common/utils/slug.util';
import {
  createPaginatedResult,
  PaginatedResult,
} from '../common/dto/paginated-result.dto';
import { getPrismaSkipTake, getPrismaOrderBy } from '../common/utils/pagination.util';

const CONTENT_INCLUDE = {
  author: { select: { id: true, name: true, avatarUrl: true } },
  category: { select: { id: true, name: true, slug: true } },
  coverImage: { select: { id: true, url: true, altText: true } },
  contentBlocks: {
    orderBy: { position: 'asc' as const },
    include: { media: { select: { id: true, url: true, altText: true } } },
  },
  _count: { select: { likes: true, comments: true } },
};

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new content draft.
   * Requires ACTIVE subscription (enforced by SubscriptionGuard at controller level).
   */
  async create(authorId: string, dto: CreateContentDto) {
    const baseSlug = generateSlug(dto.title);
    const existing = await this.prisma.content.findUnique({
      where: { slug: baseSlug },
    });
    const slug = existing ? generateUniqueSlug(dto.title) : baseSlug;

    const content = await this.prisma.$transaction(async (tx) => {
      const created = await tx.content.create({
        data: {
          title: dto.title,
          slug,
          contentType: dto.contentType ?? ContentType.ARTICLE,
          excerpt: dto.excerpt,
          description: dto.description,
          authorId,
          categoryId: dto.categoryId,
          coverImageId: dto.coverImageId,
          metaTitle: dto.metaTitle,
          metaDescription: dto.metaDescription,
          metaKeywords: dto.metaKeywords,
          status: ContentStatus.DRAFT,
        },
      });

      if (dto.blocks?.length) {
        await tx.contentBlock.createMany({
          data: dto.blocks.map((b) => ({
            contentId: created.id,
            type: b.type,
            position: b.position,
            textContent: b.textContent,
            mediaId: b.mediaId,
            metadata: b.metadata as any,
          })),
        });
      }

      return created;
    });

    return this.findById(content.id);
  }

  /**
   * Update a DRAFT or CHANGES_REQUESTED content item.
   * Only the owner can edit. Replaces blocks entirely.
   */
  async update(contentId: string, userId: string, dto: UpdateContentDto) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, deletedAt: null },
    });

    if (!content) throw new NotFoundException('Content not found.');

    if (content.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own content.');
    }

    if (
      content.status !== ContentStatus.DRAFT &&
      content.status !== ContentStatus.CHANGES_REQUESTED
    ) {
      throw new ForbiddenException(
        'Only DRAFT or CHANGES_REQUESTED content can be edited.',
      );
    }

    // Handle slug update if title changed
    let slug = content.slug;
    if (dto.title && dto.title !== content.title) {
      const base = generateSlug(dto.title);
      const conflict = await this.prisma.content.findFirst({
        where: { slug: base, id: { not: contentId } },
      });
      slug = conflict ? generateUniqueSlug(dto.title) : base;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.content.update({
        where: { id: contentId },
        data: {
          ...(dto.title && { title: dto.title, slug }),
          ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          ...(dto.coverImageId !== undefined && { coverImageId: dto.coverImageId }),
          ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
          ...(dto.metaDescription !== undefined && { metaDescription: dto.metaDescription }),
          ...(dto.metaKeywords !== undefined && { metaKeywords: dto.metaKeywords }),
        },
      });

      if (dto.blocks !== undefined) {
        // Replace all blocks
        await tx.contentBlock.deleteMany({ where: { contentId } });
        if (dto.blocks.length) {
          await tx.contentBlock.createMany({
            data: dto.blocks.map((b) => ({
              contentId,
              type: b.type,
              position: b.position,
              textContent: b.textContent,
              mediaId: b.mediaId,
              metadata: b.metadata as any,
            })),
          });
        }
      }
    });

    return this.findById(contentId);
  }

  /**
   * Submit a DRAFT for review.
   */
  async submit(contentId: string, userId: string, dto: SubmitContentDto) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, deletedAt: null },
    });

    if (!content) throw new NotFoundException('Content not found.');
    if (content.authorId !== userId) {
      throw new ForbiddenException('You can only submit your own content.');
    }
    if (content.status !== ContentStatus.DRAFT) {
      throw new ForbiddenException('Only DRAFT content can be submitted for review.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.content.update({
        where: { id: contentId },
        data: { status: ContentStatus.PENDING_REVIEW },
      });

      await tx.reviewEvent.create({
        data: {
          contentId,
          actorId: userId,
          action: ReviewAction.SUBMITTED,
          fromStatus: ContentStatus.DRAFT,
          toStatus: ContentStatus.PENDING_REVIEW,
          note: dto.note,
        },
      });

      return updated;
    });
  }

  /**
   * Resubmit a CHANGES_REQUESTED content for review.
   */
  async resubmit(contentId: string, userId: string, dto: SubmitContentDto) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, deletedAt: null },
    });

    if (!content) throw new NotFoundException('Content not found.');
    if (content.authorId !== userId) {
      throw new ForbiddenException('You can only resubmit your own content.');
    }
    if (content.status !== ContentStatus.CHANGES_REQUESTED) {
      throw new ForbiddenException(
        'Only CHANGES_REQUESTED content can be resubmitted.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.content.update({
        where: { id: contentId },
        data: { status: ContentStatus.PENDING_REVIEW },
      });

      await tx.reviewEvent.create({
        data: {
          contentId,
          actorId: userId,
          action: ReviewAction.RESUBMITTED,
          fromStatus: ContentStatus.CHANGES_REQUESTED,
          toStatus: ContentStatus.PENDING_REVIEW,
          note: dto.note,
        },
      });

      return updated;
    });
  }

  /**
   * Owner deletes their own DRAFT content (soft delete).
   */
  async delete(contentId: string, userId: string): Promise<{ message: string }> {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, deletedAt: null },
    });

    if (!content) throw new NotFoundException('Content not found.');
    if (content.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own content.');
    }
    if (content.status !== ContentStatus.DRAFT) {
      throw new ForbiddenException('Only DRAFT content can be deleted.');
    }

    await this.prisma.content.update({
      where: { id: contentId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Content deleted.' };
  }

  /**
   * Public: list published content with pagination.
   */
  async findPublished(query: ContentQueryDto): Promise<PaginatedResult<any>> {
    const { page, limit, search, contentType, categoryId, sortBy, sortOrder } = query;
    const { skip, take } = getPrismaSkipTake(page, limit);
    const allowedSort = ['publishedAt', 'viewCount', 'createdAt'];
    const orderBy = getPrismaOrderBy(sortBy, sortOrder, allowedSort);

    const where = {
      status: ContentStatus.PUBLISHED,
      deletedAt: null,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { excerpt: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(contentType && { contentType }),
      ...(categoryId && { categoryId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
          coverImage: { select: { id: true, url: true, altText: true } },
          _count: { select: { likes: true, comments: true } },
        },
        skip,
        take,
        orderBy,
      }),
      this.prisma.content.count({ where }),
    ]);

    return createPaginatedResult(items, total, page, limit);
  }

  /**
   * Public: get a single published content by slug.
   * Increments view count.
   */
  async findBySlug(slug: string) {
    const content = await this.prisma.content.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED, deletedAt: null },
      include: CONTENT_INCLUDE,
    });

    if (!content) throw new NotFoundException('Content not found.');

    // Increment view count (fire-and-forget)
    this.prisma.content
      .update({ where: { id: content.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {});

    return content;
  }

  /**
   * Get a single content item by ID (for owner or ADMIN).
   */
  async findById(id: string) {
    const content = await this.prisma.content.findFirst({
      where: { id, deletedAt: null },
      include: CONTENT_INCLUDE,
    });

    if (!content) throw new NotFoundException('Content not found.');
    return content;
  }

  /**
   * Owner: list own content across all statuses.
   */
  async findMyContent(
    userId: string,
    query: ContentQueryDto,
  ): Promise<PaginatedResult<any>> {
    const { page, limit, search, contentType } = query;
    const { skip, take } = getPrismaSkipTake(page, limit);

    const where = {
      authorId: userId,
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
          category: { select: { id: true, name: true, slug: true } },
          coverImage: { select: { id: true, url: true } },
          _count: { select: { likes: true, comments: true } },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.content.count({ where }),
    ]);

    return createPaginatedResult(items, total, page, limit);
  }

  /**
   * ADMIN: list all content with full filters.
   */
  async findAllAdmin(query: AdminContentQueryDto): Promise<PaginatedResult<any>> {
    const { page, limit, search, contentType, categoryId, status, authorId } = query;
    const { skip, take } = getPrismaSkipTake(page, limit);

    const where = {
      deletedAt: null,
      ...(search && {
        title: { contains: search, mode: 'insensitive' as const },
      }),
      ...(contentType && { contentType }),
      ...(categoryId && { categoryId }),
      ...(status && { status }),
      ...(authorId && { authorId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true } },
          _count: { select: { likes: true, comments: true } },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.content.count({ where }),
    ]);

    return createPaginatedResult(items, total, page, limit);
  }

  /**
   * ADMIN: Get the review history for a content item.
   */
  async getReviewHistory(contentId: string) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, deletedAt: null },
    });
    if (!content) throw new NotFoundException('Content not found.');

    return this.prisma.reviewEvent.findMany({
      where: { contentId },
      include: {
        actor: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * ADMIN: Hard delete content.
   */
  async adminDelete(contentId: string): Promise<{ message: string }> {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, deletedAt: null },
    });
    if (!content) throw new NotFoundException('Content not found.');

    await this.prisma.content.update({
      where: { id: contentId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Content removed.' };
  }
}
