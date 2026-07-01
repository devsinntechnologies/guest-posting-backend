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
const pagination_dto_1 = require("../common/dto/pagination.dto");
const client_1 = require("@prisma/client");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (0, pagination_dto_1.getSkip)(page, limit);
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
        return (0, pagination_dto_1.paginate)(items, total, page, limit);
    }
    async findBySlug(slug) {
        const category = await this.prisma.category.findUnique({
            where: { slug },
            include: {
                parentCategory: true,
                childCategories: true,
            },
        });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        return category;
    }
    async getArticlesBySlug(slug, query) {
        const category = await this.findBySlug(slug);
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (0, pagination_dto_1.getSkip)(page, limit);
        const where = {
            categoryId: category.id,
            status: client_1.ArticleStatus.PUBLISHED,
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
        return (0, pagination_dto_1.paginate)(items, total, page, limit);
    }
    async create(dto) {
        const baseSlug = (0, slug_util_1.generateSlug)(dto.name);
        const slug = await (0, slug_util_1.ensureUniqueSlug)(baseSlug, async (s) => {
            return !!(await this.prisma.category.findUnique({ where: { slug: s } }));
        });
        return this.prisma.category.create({
            data: { ...dto, slug },
        });
    }
    async update(id, dto) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        const data = { ...dto };
        if (dto.name) {
            const baseSlug = (0, slug_util_1.generateSlug)(dto.name);
            data.slug = await (0, slug_util_1.ensureUniqueSlug)(baseSlug, async (s) => !!(await this.prisma.category.findUnique({ where: { slug: s } })), category.slug);
        }
        return this.prisma.category.update({ where: { id }, data });
    }
    async remove(id, role) {
        if (role !== client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Only super admins can delete categories');
        }
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        return this.prisma.category.delete({ where: { id } });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map