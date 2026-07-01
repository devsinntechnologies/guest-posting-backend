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
const pagination_dto_1 = require("../common/dto/pagination.dto");
const slug_util_1 = require("../common/utils/slug.util");
const client_1 = require("@prisma/client");
let SeoService = class SeoService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (0, pagination_dto_1.getSkip)(page, limit);
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
        return (0, pagination_dto_1.paginate)(items, total, page, limit);
    }
    async findBySlug(slug) {
        const seoPage = await this.prisma.seoPage.findUnique({ where: { slug } });
        if (!seoPage)
            throw new common_1.NotFoundException('SEO page not found');
        return seoPage;
    }
    async create(dto) {
        const baseSlug = dto.slug || (0, slug_util_1.generateSlug)(dto.h1Heading || dto.pageType);
        const slug = await (0, slug_util_1.ensureUniqueSlug)(baseSlug, async (s) => {
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
    async update(id, dto) {
        const page = await this.prisma.seoPage.findUnique({ where: { id } });
        if (!page)
            throw new common_1.NotFoundException('SEO page not found');
        return this.prisma.seoPage.update({ where: { id }, data: dto });
    }
    async bulkGenerate(dto) {
        const created = [];
        if (dto.pageTypes.includes(client_1.SeoPageType.CATEGORY)) {
            const categories = await this.prisma.category.findMany();
            for (const cat of categories) {
                const existing = await this.prisma.seoPage.findFirst({
                    where: { pageType: client_1.SeoPageType.CATEGORY, referenceId: cat.id },
                });
                if (!existing) {
                    const page = await this.create({
                        pageType: client_1.SeoPageType.CATEGORY,
                        referenceId: cat.id,
                        slug: `category/${cat.slug}`,
                        metaTitle: `${cat.name} - Guest Posts & Articles`,
                        metaDescription: cat.metaDescription ||
                            `Browse ${cat.name} guest posts and articles.`,
                        h1Heading: cat.name,
                    });
                    created.push(page);
                }
            }
        }
        if (dto.pageTypes.includes(client_1.SeoPageType.TAG)) {
            const tags = await this.prisma.tag.findMany();
            for (const tag of tags) {
                const existing = await this.prisma.seoPage.findFirst({
                    where: { pageType: client_1.SeoPageType.TAG, referenceId: tag.id },
                });
                if (!existing) {
                    const page = await this.create({
                        pageType: client_1.SeoPageType.TAG,
                        referenceId: tag.id,
                        slug: `tag/${tag.slug}`,
                        metaTitle: `#${tag.name} Articles`,
                        h1Heading: tag.name,
                    });
                    created.push(page);
                }
            }
        }
        if (dto.pageTypes.includes(client_1.SeoPageType.AUTHOR)) {
            const authors = await this.prisma.user.findMany({
                where: { deletedAt: null },
            });
            for (const author of authors) {
                const existing = await this.prisma.seoPage.findFirst({
                    where: { pageType: client_1.SeoPageType.AUTHOR, referenceId: author.id },
                });
                if (!existing) {
                    const authorSlug = (0, slug_util_1.generateSlug)(author.name);
                    const page = await this.create({
                        pageType: client_1.SeoPageType.AUTHOR,
                        referenceId: author.id,
                        slug: `author/${authorSlug}`,
                        metaTitle: `Articles by ${author.name}`,
                        h1Heading: author.name,
                    });
                    created.push(page);
                }
            }
        }
        if (dto.pageTypes.includes(client_1.SeoPageType.WRITE_FOR_US)) {
            const categories = await this.prisma.category.findMany();
            for (const cat of categories) {
                const existing = await this.prisma.seoPage.findFirst({
                    where: {
                        pageType: client_1.SeoPageType.WRITE_FOR_US,
                        referenceId: cat.id,
                    },
                });
                if (!existing) {
                    const page = await this.create({
                        pageType: client_1.SeoPageType.WRITE_FOR_US,
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
                where: { status: client_1.ArticleStatus.PUBLISHED, deletedAt: null },
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
};
exports.SeoService = SeoService;
exports.SeoService = SeoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeoService);
//# sourceMappingURL=seo.service.js.map