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
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const slug_util_1 = require("../common/utils/slug.util");
const paginated_result_dto_1 = require("../common/dto/paginated-result.dto");
const pagination_util_1 = require("../common/utils/pagination.util");
const CONTENT_INCLUDE = {
    author: { select: { id: true, name: true, avatarUrl: true } },
    category: { select: { id: true, name: true, slug: true } },
    coverImage: { select: { id: true, url: true, altText: true } },
    contentBlocks: {
        orderBy: { position: 'asc' },
        include: { media: { select: { id: true, url: true, altText: true } } },
    },
    _count: { select: { likes: true, comments: true } },
};
let ContentService = class ContentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(authorId, dto) {
        const baseSlug = (0, slug_util_1.generateSlug)(dto.title);
        const existing = await this.prisma.content.findUnique({
            where: { slug: baseSlug },
        });
        const slug = existing ? (0, slug_util_1.generateUniqueSlug)(dto.title) : baseSlug;
        const content = await this.prisma.$transaction(async (tx) => {
            const created = await tx.content.create({
                data: {
                    title: dto.title,
                    slug,
                    contentType: dto.contentType ?? client_1.ContentType.ARTICLE,
                    excerpt: dto.excerpt,
                    description: dto.description,
                    authorId,
                    categoryId: dto.categoryId,
                    coverImageId: dto.coverImageId,
                    metaTitle: dto.metaTitle,
                    metaDescription: dto.metaDescription,
                    metaKeywords: dto.metaKeywords,
                    status: client_1.ContentStatus.DRAFT,
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
                        metadata: b.metadata,
                    })),
                });
            }
            return created;
        });
        return this.findById(content.id);
    }
    async update(contentId, userId, dto) {
        const content = await this.prisma.content.findFirst({
            where: { id: contentId, deletedAt: null },
        });
        if (!content)
            throw new common_1.NotFoundException('Content not found.');
        if (content.authorId !== userId) {
            throw new common_1.ForbiddenException('You can only edit your own content.');
        }
        if (content.status !== client_1.ContentStatus.DRAFT &&
            content.status !== client_1.ContentStatus.CHANGES_REQUESTED) {
            throw new common_1.ForbiddenException('Only DRAFT or CHANGES_REQUESTED content can be edited.');
        }
        let slug = content.slug;
        if (dto.title && dto.title !== content.title) {
            const base = (0, slug_util_1.generateSlug)(dto.title);
            const conflict = await this.prisma.content.findFirst({
                where: { slug: base, id: { not: contentId } },
            });
            slug = conflict ? (0, slug_util_1.generateUniqueSlug)(dto.title) : base;
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
                await tx.contentBlock.deleteMany({ where: { contentId } });
                if (dto.blocks.length) {
                    await tx.contentBlock.createMany({
                        data: dto.blocks.map((b) => ({
                            contentId,
                            type: b.type,
                            position: b.position,
                            textContent: b.textContent,
                            mediaId: b.mediaId,
                            metadata: b.metadata,
                        })),
                    });
                }
            }
        });
        return this.findById(contentId);
    }
    async submit(contentId, userId, dto) {
        const content = await this.prisma.content.findFirst({
            where: { id: contentId, deletedAt: null },
        });
        if (!content)
            throw new common_1.NotFoundException('Content not found.');
        if (content.authorId !== userId) {
            throw new common_1.ForbiddenException('You can only submit your own content.');
        }
        if (content.status !== client_1.ContentStatus.DRAFT) {
            throw new common_1.ForbiddenException('Only DRAFT content can be submitted for review.');
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.content.update({
                where: { id: contentId },
                data: { status: client_1.ContentStatus.PENDING_REVIEW },
            });
            await tx.reviewEvent.create({
                data: {
                    contentId,
                    actorId: userId,
                    action: client_1.ReviewAction.SUBMITTED,
                    fromStatus: client_1.ContentStatus.DRAFT,
                    toStatus: client_1.ContentStatus.PENDING_REVIEW,
                    note: dto.note,
                },
            });
            return updated;
        });
    }
    async resubmit(contentId, userId, dto) {
        const content = await this.prisma.content.findFirst({
            where: { id: contentId, deletedAt: null },
        });
        if (!content)
            throw new common_1.NotFoundException('Content not found.');
        if (content.authorId !== userId) {
            throw new common_1.ForbiddenException('You can only resubmit your own content.');
        }
        if (content.status !== client_1.ContentStatus.CHANGES_REQUESTED) {
            throw new common_1.ForbiddenException('Only CHANGES_REQUESTED content can be resubmitted.');
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.content.update({
                where: { id: contentId },
                data: { status: client_1.ContentStatus.PENDING_REVIEW },
            });
            await tx.reviewEvent.create({
                data: {
                    contentId,
                    actorId: userId,
                    action: client_1.ReviewAction.RESUBMITTED,
                    fromStatus: client_1.ContentStatus.CHANGES_REQUESTED,
                    toStatus: client_1.ContentStatus.PENDING_REVIEW,
                    note: dto.note,
                },
            });
            return updated;
        });
    }
    async delete(contentId, userId) {
        const content = await this.prisma.content.findFirst({
            where: { id: contentId, deletedAt: null },
        });
        if (!content)
            throw new common_1.NotFoundException('Content not found.');
        if (content.authorId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own content.');
        }
        if (content.status !== client_1.ContentStatus.DRAFT) {
            throw new common_1.ForbiddenException('Only DRAFT content can be deleted.');
        }
        await this.prisma.content.update({
            where: { id: contentId },
            data: { deletedAt: new Date() },
        });
        return { message: 'Content deleted.' };
    }
    async findPublished(query) {
        const { page, limit, search, contentType, categoryId, sortBy, sortOrder } = query;
        const { skip, take } = (0, pagination_util_1.getPrismaSkipTake)(page, limit);
        const allowedSort = ['publishedAt', 'viewCount', 'createdAt'];
        const orderBy = (0, pagination_util_1.getPrismaOrderBy)(sortBy, sortOrder, allowedSort);
        const where = {
            status: client_1.ContentStatus.PUBLISHED,
            deletedAt: null,
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { excerpt: { contains: search, mode: 'insensitive' } },
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
        return (0, paginated_result_dto_1.createPaginatedResult)(items, total, page, limit);
    }
    async findBySlug(slug) {
        const content = await this.prisma.content.findFirst({
            where: { slug, status: client_1.ContentStatus.PUBLISHED, deletedAt: null },
            include: CONTENT_INCLUDE,
        });
        if (!content)
            throw new common_1.NotFoundException('Content not found.');
        this.prisma.content
            .update({ where: { id: content.id }, data: { viewCount: { increment: 1 } } })
            .catch(() => { });
        return content;
    }
    async findById(id) {
        const content = await this.prisma.content.findFirst({
            where: { id, deletedAt: null },
            include: CONTENT_INCLUDE,
        });
        if (!content)
            throw new common_1.NotFoundException('Content not found.');
        return content;
    }
    async findMyContent(userId, query) {
        const { page, limit, search, contentType } = query;
        const { skip, take } = (0, pagination_util_1.getPrismaSkipTake)(page, limit);
        const where = {
            authorId: userId,
            deletedAt: null,
            ...(search && {
                title: { contains: search, mode: 'insensitive' },
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
        return (0, paginated_result_dto_1.createPaginatedResult)(items, total, page, limit);
    }
    async findAllAdmin(query) {
        const { page, limit, search, contentType, categoryId, status, authorId } = query;
        const { skip, take } = (0, pagination_util_1.getPrismaSkipTake)(page, limit);
        const where = {
            deletedAt: null,
            ...(search && {
                title: { contains: search, mode: 'insensitive' },
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
        return (0, paginated_result_dto_1.createPaginatedResult)(items, total, page, limit);
    }
    async getReviewHistory(contentId) {
        const content = await this.prisma.content.findFirst({
            where: { id: contentId, deletedAt: null },
        });
        if (!content)
            throw new common_1.NotFoundException('Content not found.');
        return this.prisma.reviewEvent.findMany({
            where: { contentId },
            include: {
                actor: { select: { id: true, name: true, role: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async adminDelete(contentId) {
        const content = await this.prisma.content.findFirst({
            where: { id: contentId, deletedAt: null },
        });
        if (!content)
            throw new common_1.NotFoundException('Content not found.');
        await this.prisma.content.update({
            where: { id: contentId },
            data: { deletedAt: new Date() },
        });
        return { message: 'Content removed.' };
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContentService);
//# sourceMappingURL=content.service.js.map