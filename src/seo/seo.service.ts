import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSeoPageDto,
  SeoPageQueryDto,
  UpdateSeoPageDto,
} from './dto/seo.dto';
import {
  createPaginatedResult,
  PaginatedResult,
} from '../common/dto/paginated-result.dto';
import { getPrismaSkipTake } from '../common/utils/pagination.util';
import { ContentStatus, SeoPage } from '@prisma/client';

@Injectable()
export class SeoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new SEO metadata page.
   * ADMIN only.
   */
  async create(dto: CreateSeoPageDto): Promise<SeoPage> {
    const existing = await this.prisma.seoPage.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`SEO page with slug "${dto.slug}" already exists.`);
    }

    return this.prisma.seoPage.create({
      data: {
        slug: dto.slug,
        type: dto.type,
        title: dto.title,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        metaKeywords: dto.metaKeywords,
        ogImage: dto.ogImage,
        canonicalUrl: dto.canonicalUrl,
        categoryId: dto.categoryId,
        isActive: dto.isActive ?? true,
      },
    });
  }

  /**
   * Update an SEO page.
   * ADMIN only.
   */
  async update(id: string, dto: UpdateSeoPageDto): Promise<SeoPage> {
    const seoPage = await this.prisma.seoPage.findUnique({
      where: { id },
    });

    if (!seoPage) {
      throw new NotFoundException('SEO page not found.');
    }

    if (dto.slug && dto.slug !== seoPage.slug) {
      const conflict = await this.prisma.seoPage.findUnique({
        where: { slug: dto.slug },
      });
      if (conflict) {
        throw new ConflictException(`SEO page with slug "${dto.slug}" already exists.`);
      }
    }

    return this.prisma.seoPage.update({
      where: { id },
      data: {
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
        ...(dto.metaDescription !== undefined && { metaDescription: dto.metaDescription }),
        ...(dto.metaKeywords !== undefined && { metaKeywords: dto.metaKeywords }),
        ...(dto.ogImage !== undefined && { ogImage: dto.ogImage }),
        ...(dto.canonicalUrl !== undefined && { canonicalUrl: dto.canonicalUrl }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  /**
   * Delete an SEO page.
   * ADMIN only.
   */
  async delete(id: string): Promise<{ message: string }> {
    const seoPage = await this.prisma.seoPage.findUnique({
      where: { id },
    });

    if (!seoPage) {
      throw new NotFoundException('SEO page not found.');
    }

    await this.prisma.seoPage.delete({ where: { id } });
    return { message: 'SEO page deleted successfully.' };
  }

  /**
   * List SEO pages (ADMIN).
   */
  async findAll(query: SeoPageQueryDto): Promise<PaginatedResult<SeoPage>> {
    const { page, limit, type } = query;
    const { skip, take } = getPrismaSkipTake(page, limit);

    const where = {
      ...(type && { type }),
    };

    const [items, total] = await Promise.all([
      this.prisma.seoPage.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
        skip,
        take,
        orderBy: { slug: 'asc' },
      }),
      this.prisma.seoPage.count({ where }),
    ]);

    return createPaginatedResult(items, total, page, limit);
  }

  /**
   * Public: find SEO config by slug.
   */
  async findBySlug(slug: string): Promise<SeoPage> {
    const seoPage = await this.prisma.seoPage.findFirst({
      where: { slug, isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!seoPage) {
      throw new NotFoundException(`SEO config for slug "${slug}" not found.`);
    }

    return seoPage;
  }

  /**
   * Public: Get sitemap datasets for XML generation.
   */
  async getSitemapData() {
    const [contents, categories, seoPages] = await Promise.all([
      // Live content
      this.prisma.content.findMany({
        where: { status: ContentStatus.PUBLISHED, deletedAt: null },
        select: { slug: true, updatedAt: true, publishedAt: true },
      }),
      // Live categories
      this.prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      // Programmatic SEO configs
      this.prisma.seoPage.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true, type: true },
      }),
    ]);

    return {
      content: contents.map((c) => ({
        loc: `/content/slug/${c.slug}`,
        lastmod: c.updatedAt,
        publishedAt: c.publishedAt,
      })),
      categories: categories.map((cat) => ({
        loc: `/categories/slug/${cat.slug}`,
        lastmod: cat.updatedAt,
      })),
      seoPages: seoPages.map((p) => ({
        loc: `/${p.slug}`,
        lastmod: p.updatedAt,
        type: p.type,
      })),
    };
  }
}
