"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const slug_util_1 = require("../common/utils/slug.util");
const paginated_result_dto_1 = require("../common/dto/paginated-result.dto");
const pagination_util_1 = require("../common/utils/pagination.util");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        if (dto.parentCategoryId) {
            const parent = await this.prisma.category.findUnique({
                where: { id: dto.parentCategoryId },
            });
            if (!parent) {
                throw new common_1.NotFoundException('Parent category not found.');
            }
        }
        const baseSlug = (0, slug_util_1.generateSlug)(dto.name);
        let slug = baseSlug;
        const existing = await this.prisma.category.findUnique({ where: { slug } });
        if (existing) {
            slug = (0, slug_util_1.generateUniqueSlug)(dto.name);
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
    async findAll(query, onlyActive = false) {
        const { page, limit, search, parentCategoryId, isActive } = query;
        const { skip, take } = (0, pagination_util_1.getPrismaSkipTake)(page, limit);
        const where = {
            ...(search && {
                name: { contains: search, mode: 'insensitive' },
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
        return (0, paginated_result_dto_1.createPaginatedResult)(items, total, page, limit);
    }
    async findBySlug(slug) {
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
            throw new common_1.NotFoundException('Category not found.');
        }
        return category;
    }
    async findById(id) {
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
            throw new common_1.NotFoundException('Category not found.');
        }
        return category;
    }
    async update(id, dto) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category) {
            throw new common_1.NotFoundException('Category not found.');
        }
        if (dto.parentCategoryId) {
            if (dto.parentCategoryId === id) {
                throw new common_1.BadRequestException('A category cannot be its own parent.');
            }
            const parent = await this.prisma.category.findUnique({
                where: { id: dto.parentCategoryId },
            });
            if (!parent) {
                throw new common_1.NotFoundException('Parent category not found.');
            }
        }
        let slug = category.slug;
        if (dto.name && dto.name !== category.name) {
            const newBase = (0, slug_util_1.generateSlug)(dto.name);
            const conflict = await this.prisma.category.findUnique({
                where: { slug: newBase },
            });
            slug = conflict ? (0, slug_util_1.generateUniqueSlug)(dto.name) : newBase;
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
    async delete(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { childCategories: { take: 1 } },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found.');
        }
        if (category.childCategories.length > 0) {
            throw new common_1.ConflictException('Cannot delete a category that has sub-categories. Remove them first.');
        }
        const contentCount = await this.prisma.content.count({
            where: { categoryId: id, deletedAt: null },
        });
        if (contentCount > 0) {
            throw new common_1.ConflictException(`Cannot delete a category that has ${contentCount} content item(s) associated with it.`);
        }
        await this.prisma.category.delete({ where: { id } });
        return { message: 'Category deleted successfully.' };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map