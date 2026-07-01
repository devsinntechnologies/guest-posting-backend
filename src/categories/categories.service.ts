import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';
import { generateSlug, ensureUniqueSlug } from '../common/utils/slug.util';
import { PaginationDto, paginate, getSkip } from '../common/dto/pagination.dto';
import { UserRole, ArticleStatus } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = getSkip(page, limit);

    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        skip,
        take: limit,
        include: {
          childCategories: true,
          parentCategory: { select: { id: true, name: true, slug: true } },
          _count: { select: { articles: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.category.count(),
    ]);

    return paginate(items, total, page, limit);
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parentCategory: true,
        childCategories: true,
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async getArticlesBySlug(slug: string, query: PaginationDto) {
    const category = await this.findBySlug(slug);
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = getSkip(page, limit);

    const where = {
      categoryId: category.id,
      status: ArticleStatus.PUBLISHED,
      deletedAt: null,
    };

    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          author: { select: { id: true, name: true } },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return paginate(items, total, page, limit);
  }

  async create(dto: CreateCategoryDto) {
    const baseSlug = generateSlug(dto.name);
    const slug = await ensureUniqueSlug(baseSlug, async (s) => {
      return !!(await this.prisma.category.findUnique({ where: { slug: s } }));
    });

    return this.prisma.category.create({
      data: { ...dto, slug },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    const data: Record<string, unknown> = { ...dto };
    if (dto.name) {
      const baseSlug = generateSlug(dto.name);
      data.slug = await ensureUniqueSlug(
        baseSlug,
        async (s) =>
          !!(await this.prisma.category.findUnique({ where: { slug: s } })),
        category.slug,
      );
    }

    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: string, role: UserRole) {
    if (role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can delete categories');
    }
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return this.prisma.category.delete({ where: { id } });
  }
}
