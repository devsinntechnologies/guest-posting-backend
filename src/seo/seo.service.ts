import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSeoPageDto,
  BulkGenerateSeoDto,
  SeoPageQueryDto,
  UpdateSeoMetaDto,
} from './dto/seo.dto';
import { paginate, getSkip } from '../common/dto/pagination.dto';
import { generateSlug, ensureUniqueSlug } from '../common/utils/slug.util';
import { SeoPageType, ArticleStatus } from '@prisma/client';

@Injectable()
export class SeoService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: SeoPageQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = getSkip(page, limit);

    const where = query.pageType ? { pageType: query.pageType } : {};

    const [items, total] = await Promise.all([
      this.prisma.seoPage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.seoPage.count({ where }),
    ]);

    return paginate(items, total, page, limit);
  }

  async findBySlug(slug: string) {
    const seoPage = await this.prisma.seoPage.findUnique({ where: { slug } });
    if (!seoPage) throw new NotFoundException('SEO page not found');
    return seoPage;
  }

  async create(dto: CreateSeoPageDto) {
    const baseSlug = dto.slug || generateSlug(dto.h1Heading || dto.pageType);
    const slug = await ensureUniqueSlug(baseSlug, async (s) => {
      return !!(await this.prisma.seoPage.findUnique({ where: { slug: s } }));
    });

    return this.prisma.seoPage.create({
      data: {
        pageType: dto.pageType,
        referenceId: dto.referenceId,
        slug,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        h1Heading: dto.h1Heading,
        customContent: dto.customContent,
      },
    });
  }

  async update(id: string, dto: UpdateSeoMetaDto) {
    const page = await this.prisma.seoPage.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('SEO page not found');
    return this.prisma.seoPage.update({ where: { id }, data: dto });
  }

  /** Bulk-generate programmatic SEO pages for categories, tags, authors, and write-for-us patterns. */
  async bulkGenerate(dto: BulkGenerateSeoDto) {
    const created: unknown[] = [];

    if (dto.pageTypes.includes(SeoPageType.CATEGORY)) {
      const categories = await this.prisma.category.findMany();
      for (const cat of categories) {
        const existing = await this.prisma.seoPage.findFirst({
          where: { pageType: SeoPageType.CATEGORY, referenceId: cat.id },
        });
        if (!existing) {
          const page = await this.create({
            pageType: SeoPageType.CATEGORY,
            referenceId: cat.id,
            slug: `category/${cat.slug}`,
            metaTitle: `${cat.name} - Guest Posts & Articles`,
            metaDescription:
              cat.metaDescription ||
              `Browse ${cat.name} guest posts and articles.`,
            h1Heading: cat.name,
          });
          created.push(page);
        }
      }
    }

    if (dto.pageTypes.includes(SeoPageType.TAG)) {
      const tags = await this.prisma.tag.findMany();
      for (const tag of tags) {
        const existing = await this.prisma.seoPage.findFirst({
          where: { pageType: SeoPageType.TAG, referenceId: tag.id },
        });
        if (!existing) {
          const page = await this.create({
            pageType: SeoPageType.TAG,
            referenceId: tag.id,
            slug: `tag/${tag.slug}`,
            metaTitle: `#${tag.name} Articles`,
            h1Heading: tag.name,
          });
          created.push(page);
        }
      }
    }

    if (dto.pageTypes.includes(SeoPageType.AUTHOR)) {
      const authors = await this.prisma.user.findMany({
        where: { deletedAt: null },
      });
      for (const author of authors) {
        const existing = await this.prisma.seoPage.findFirst({
          where: { pageType: SeoPageType.AUTHOR, referenceId: author.id },
        });
        if (!existing) {
          const authorSlug = generateSlug(author.name);
          const page = await this.create({
            pageType: SeoPageType.AUTHOR,
            referenceId: author.id,
            slug: `author/${authorSlug}`,
            metaTitle: `Articles by ${author.name}`,
            h1Heading: author.name,
          });
          created.push(page);
        }
      }
    }

    if (dto.pageTypes.includes(SeoPageType.WRITE_FOR_US)) {
      const categories = await this.prisma.category.findMany();
      for (const cat of categories) {
        const existing = await this.prisma.seoPage.findFirst({
          where: {
            pageType: SeoPageType.WRITE_FOR_US,
            referenceId: cat.id,
          },
        });
        if (!existing) {
          const page = await this.create({
            pageType: SeoPageType.WRITE_FOR_US,
            referenceId: cat.id,
            slug: `write-for-us/${cat.slug}`,
            metaTitle: `Write For Us ${cat.name}`,
            metaDescription: `Submit a guest post in ${cat.name}.`,
            h1Heading: `Write For Us ${cat.name}`,
            customContent: `Submit your ${cat.name} guest post to Devsinn Insights.`,
          });
          created.push(page);
        }
      }
    }

    return { created: created.length, pages: created };
  }

  async getSitemapData() {
    const [articles, seoPages] = await Promise.all([
      this.prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED, deletedAt: null },
        select: { slug: true, updatedAt: true, publishedAt: true },
      }),
      this.prisma.seoPage.findMany({
        select: { slug: true, updatedAt: true, pageType: true },
      }),
    ]);

    return {
      articles: articles.map((a) => ({
        loc: `/articles/${a.slug}`,
        lastmod: a.updatedAt,
        publishedAt: a.publishedAt,
      })),
      seoPages: seoPages.map((p) => ({
        loc: `/${p.slug}`,
        lastmod: p.updatedAt,
        pageType: p.pageType,
      })),
    };
  }
}
