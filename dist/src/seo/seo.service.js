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
exports.SeoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const paginated_result_dto_1 = require("../common/dto/paginated-result.dto");
const pagination_util_1 = require("../common/utils/pagination.util");
const client_1 = require("@prisma/client");
let SeoService = class SeoService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existing = await this.prisma.seoPage.findUnique({
            where: { slug: dto.slug },
        });
        if (existing) {
            throw new common_1.ConflictException(`SEO page with slug "${dto.slug}" already exists.`);
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
    async update(id, dto) {
        const seoPage = await this.prisma.seoPage.findUnique({
            where: { id },
        });
        if (!seoPage) {
            throw new common_1.NotFoundException('SEO page not found.');
        }
        if (dto.slug && dto.slug !== seoPage.slug) {
            const conflict = await this.prisma.seoPage.findUnique({
                where: { slug: dto.slug },
            });
            if (conflict) {
                throw new common_1.ConflictException(`SEO page with slug "${dto.slug}" already exists.`);
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
    async delete(id) {
        const seoPage = await this.prisma.seoPage.findUnique({
            where: { id },
        });
        if (!seoPage) {
            throw new common_1.NotFoundException('SEO page not found.');
        }
        await this.prisma.seoPage.delete({ where: { id } });
        return { message: 'SEO page deleted successfully.' };
    }
    async findAll(query) {
        const { page, limit, type } = query;
        const { skip, take } = (0, pagination_util_1.getPrismaSkipTake)(page, limit);
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
        return (0, paginated_result_dto_1.createPaginatedResult)(items, total, page, limit);
    }
    async findBySlug(slug) {
        const seoPage = await this.prisma.seoPage.findFirst({
            where: { slug, isActive: true },
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
        });
        if (!seoPage) {
            throw new common_1.NotFoundException(`SEO config for slug "${slug}" not found.`);
        }
        return seoPage;
    }
    async getSitemapData() {
        const [contents, categories, seoPages] = await Promise.all([
            this.prisma.content.findMany({
                where: { status: client_1.ContentStatus.PUBLISHED, deletedAt: null },
                select: { slug: true, updatedAt: true, publishedAt: true },
            }),
            this.prisma.category.findMany({
                where: { isActive: true },
                select: { slug: true, updatedAt: true },
            }),
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
};
exports.SeoService = SeoService;
exports.SeoService = SeoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeoService);
//# sourceMappingURL=seo.service.js.map