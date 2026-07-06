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
exports.ArticlesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const workflow_service_1 = require("../workflow/workflow.service");
const notifications_service_1 = require("../notifications/notifications.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const slug_util_1 = require("../common/utils/slug.util");
const sanitize_util_1 = require("../common/utils/sanitize.util");
const client_1 = require("@prisma/client");
let ArticlesService = class ArticlesService {
    prisma;
    workflow;
    notifications;
    constructor(prisma, workflow, notifications) {
        this.prisma = prisma;
        this.workflow = workflow;
        this.notifications = notifications;
    }
    async findAll(query, userRole) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (0, pagination_dto_1.getSkip)(page, limit);
        const where = {
            deletedAt: null,
            ...(userRole === client_1.UserRole.CONTRIBUTOR || !userRole
                ? { status: client_1.ArticleStatus.PUBLISHED }
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
        const orderBy = query.sortBy
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
        return (0, pagination_dto_1.paginate)(items, total, page, limit);
    }
    async findBySlug(slug) {
        const article = await this.prisma.article.findFirst({
            where: { slug, deletedAt: null, status: client_1.ArticleStatus.PUBLISHED },
            include: {
                author: { select: { id: true, name: true, avatarUrl: true } },
                category: true,
                articleTags: { include: { tag: true } },
            },
        });
        if (!article)
            throw new common_1.NotFoundException('Article not found');
        await this.prisma.article.update({
            where: { id: article.id },
            data: { viewCount: { increment: 1 } },
        });
        return article;
    }
    async findById(id) {
        const article = await this.prisma.article.findFirst({
            where: { id, deletedAt: null },
            include: {
                author: { select: { id: true, name: true, email: true } },
                category: true,
                articleTags: { include: { tag: true } },
            },
        });
        if (!article)
            throw new common_1.NotFoundException('Article not found');
        return article;
    }
    async mySubmissions(userId, query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (0, pagination_dto_1.getSkip)(page, limit);
        const where = {
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
        return (0, pagination_dto_1.paginate)(items, total, page, limit);
    }
    async create(dto, authorId) {
        const baseSlug = (0, slug_util_1.generateSlug)(dto.title);
        const slug = await (0, slug_util_1.ensureUniqueSlug)(baseSlug, async (s) => {
            const existing = await this.prisma.article.findUnique({
                where: { slug: s },
            });
            return !!existing;
        });
        const content = (0, sanitize_util_1.sanitizeContent)(dto.content);
        const status = dto.submit
            ? client_1.ArticleStatus.PENDING_REVIEW
            : client_1.ArticleStatus.DRAFT;
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
                readingTimeMinutes: (0, sanitize_util_1.calculateReadingTime)(content),
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
        if (status === client_1.ArticleStatus.PENDING_REVIEW) {
            await this.onSubmit(article.id, authorId);
        }
        return article;
    }
    async update(id, dto, userId, userRole) {
        const article = await this.findById(id);
        this.assertCanEdit(article, userId, userRole);
        const data = {};
        if (dto.title) {
            data.title = dto.title;
            const baseSlug = (0, slug_util_1.generateSlug)(dto.title);
            data.slug = await (0, slug_util_1.ensureUniqueSlug)(baseSlug, async (s) => {
                const existing = await this.prisma.article.findUnique({
                    where: { slug: s },
                });
                return !!existing && existing.id !== id;
            }, article.slug);
        }
        if (dto.content) {
            data.content = (0, sanitize_util_1.sanitizeContent)(dto.content);
            data.readingTimeMinutes = (0, sanitize_util_1.calculateReadingTime)(dto.content);
        }
        if (dto.excerpt !== undefined)
            data.excerpt = dto.excerpt;
        if (dto.featuredImageUrl !== undefined)
            data.featuredImageUrl = dto.featuredImageUrl;
        if (dto.categoryId !== undefined)
            data.category = { connect: { id: dto.categoryId } };
        if (dto.targetUrl !== undefined)
            data.targetUrl = dto.targetUrl;
        if (dto.anchorText !== undefined)
            data.anchorText = dto.anchorText;
        if (dto.metaTitle !== undefined)
            data.metaTitle = dto.metaTitle;
        if (dto.metaDescription !== undefined)
            data.metaDescription = dto.metaDescription;
        if (dto.metaKeywords !== undefined)
            data.metaKeywords = dto.metaKeywords;
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
    async updateStatus(id, dto, actorId, actorRole) {
        if (actorRole === client_1.UserRole.CONTRIBUTOR &&
            dto.status === client_1.ArticleStatus.PENDING_REVIEW) {
            const article = await this.findById(id);
            if (article.authorId !== actorId) {
                throw new common_1.ForbiddenException("Cannot submit another user's article");
            }
        }
        else if (actorRole === client_1.UserRole.CONTRIBUTOR) {
            throw new common_1.ForbiddenException('Contributors cannot change article status');
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
    async softDelete(id, userId, userRole) {
        const article = await this.findById(id);
        if (userRole === client_1.UserRole.CONTRIBUTOR && article.authorId !== userId) {
            throw new common_1.ForbiddenException("Cannot delete another user's article");
        }
        return this.prisma.article.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    assertCanEdit(article, userId, userRole) {
        if (userRole === client_1.UserRole.ADMIN) {
            return;
        }
        if (article.authorId !== userId) {
            throw new common_1.ForbiddenException('You can only edit your own articles');
        }
        const editableStatuses = [
            client_1.ArticleStatus.DRAFT,
            client_1.ArticleStatus.PENDING_REVIEW,
            client_1.ArticleStatus.REJECTED,
        ];
        if (!editableStatuses.includes(article.status)) {
            throw new common_1.BadRequestException('Cannot edit article in current status');
        }
    }
    async onSubmit(articleId, authorId) {
        await this.prisma.submissionLog.create({
            data: {
                articleId,
                actorId: authorId,
                fromStatus: client_1.ArticleStatus.DRAFT,
                toStatus: client_1.ArticleStatus.PENDING_REVIEW,
                note: 'Article submitted for review',
            },
        });
        await this.notifications.notifySubmissionReceived(articleId, authorId);
    }
    async onStatusChange(article, status) {
        if (status === client_1.ArticleStatus.REJECTED) {
            await this.notifications.create({
                userId: article.authorId,
                type: client_1.NotificationType.ARTICLE_REJECTED,
                title: 'Article Rejected',
                message: `Your article "${article.title}" was rejected.`,
                metadata: { articleId: article.id },
            });
        }
        if (status === client_1.ArticleStatus.PUBLISHED) {
            await this.notifications.create({
                userId: article.authorId,
                type: client_1.NotificationType.ARTICLE_PUBLISHED,
                title: 'Article Published',
                message: `Your article "${article.title}" is now live!`,
                metadata: { articleId: article.id, slug: article.slug },
            });
        }
        if (status === client_1.ArticleStatus.APPROVED ||
            status === client_1.ArticleStatus.REJECTED) {
            await this.notifications.create({
                userId: article.authorId,
                type: client_1.NotificationType.STATUS_CHANGED,
                title: 'Article Status Updated',
                message: `Your article "${article.title}" status changed to ${status}.`,
                metadata: { articleId: article.id, status },
            });
        }
    }
};
exports.ArticlesService = ArticlesService;
exports.ArticlesService = ArticlesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_service_1.WorkflowService,
        notifications_service_1.NotificationsService])
], ArticlesService);
//# sourceMappingURL=articles.service.js.map