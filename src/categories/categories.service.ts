import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CategoryQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';
import { generateSlug, generateUniqueSlug } from '../common/utils/slug.util';
import {
  createPaginatedResult,
  PaginatedResult,
} from '../common/dto/paginated-result.dto';
import { getPrismaSkipTake } from '../common/utils/pagination.util';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new category. Auto-generates slug from name.
   * ADMIN only.
   */
  async create(dto: CreateCategoryDto): Promise<Category> {
    // Validate parent exists if provided
    if (dto.parentCategoryId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentCategoryId },
      });
      if (!parent) {
        throw new NotFoundException('Parent category not found.');
      }
    }

    // Generate unique slug
    const baseSlug = generateSlug(dto.name);
    let slug = baseSlug;

    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = generateUniqueSlug(dto.name);
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        metaKeywords: dto.metaKeywords,
        parentCategoryId: dto.parentCategoryId,
        isActive: dto.isActive ?? true,
      },
    });
  }

  /**
   * Public: List all active categories (tree structure via childCategories).
   */
  async findAll(
    query: CategoryQueryDto,
    onlyActive = false,
  ): Promise<PaginatedResult<Category>> {
    const { page, limit, search, parentCategoryId, isActive } = query;
    const { skip, take } = getPrismaSkipTake(page, limit);

    const where = {
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
      ...(parentCategoryId !== undefined && { parentCategoryId }),
      ...(onlyActive && { isActive: true }),
      ...(isActive !== undefined && !onlyActive && { isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        include: {
          childCategories: {
            where: onlyActive ? { isActive: true } : undefined,
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
              parentCategoryId: true,
            },
          },
          parentCategory: {
            select: { id: true, name: true, slug: true },
          },
        },
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.category.count({ where }),
    ]);

    return createPaginatedResult(items, total, page, limit);
  }

  /**
   * Get a single category by slug. Used for public browsing.
   */
  async findBySlug(slug: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        childCategories: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true },
        },
        parentCategory: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    return category;
  }

  /**
   * Get a single category by ID.
   */
  async findById(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        childCategories: {
          select: { id: true, name: true, slug: true, isActive: true },
        },
        parentCategory: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    return category;
  }

  /**
   * Update a category. ADMIN only.
   */
  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    // Prevent circular parent references
    if (dto.parentCategoryId) {
      if (dto.parentCategoryId === id) {
        throw new BadRequestException('A category cannot be its own parent.');
      }
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentCategoryId },
      });
      if (!parent) {
        throw new NotFoundException('Parent category not found.');
      }
    }

    // Handle slug change if name is updated
    let slug = category.slug;
    if (dto.name && dto.name !== category.name) {
      const newBase = generateSlug(dto.name);
      const conflict = await this.prisma.category.findUnique({
        where: { slug: newBase },
      });
      slug = conflict ? generateUniqueSlug(dto.name) : newBase;
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name, slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
        ...(dto.metaDescription !== undefined && {
          metaDescription: dto.metaDescription,
        }),
        ...(dto.metaKeywords !== undefined && {
          metaKeywords: dto.metaKeywords,
        }),
        ...(dto.parentCategoryId !== undefined && {
          parentCategoryId: dto.parentCategoryId,
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  /**
   * Delete a category. ADMIN only.
   * Fails if the category has published content associated.
   */
  async delete(id: string): Promise<{ message: string }> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { childCategories: { take: 1 } },
    });

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    if (category.childCategories.length > 0) {
      throw new ConflictException(
        'Cannot delete a category that has sub-categories. Remove them first.',
      );
    }

    const contentCount = await this.prisma.content.count({
      where: { categoryId: id, deletedAt: null },
    });

    if (contentCount > 0) {
      throw new ConflictException(
        `Cannot delete a category that has ${contentCount} content item(s) associated with it.`,
      );
    }

    await this.prisma.category.delete({ where: { id } });

    return { message: 'Category deleted successfully.' };
  }
}
