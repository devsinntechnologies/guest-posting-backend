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
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const paginated_result_dto_1 = require("../common/dto/paginated-result.dto");
const pagination_util_1 = require("../common/utils/pagination.util");
let ReviewService = class ReviewService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getQueue(query) {
        const { page, limit, search, contentType } = query;
        const { skip, take } = (0, pagination_util_1.getPrismaSkipTake)(page, limit);
        const where = {
            status: client_1.ContentStatus.PENDING_REVIEW,
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
                    author: { select: { id: true, name: true, email: true } },
                    category: { select: { id: true, name: true } },
                },
                skip,
                take,
                orderBy: { updatedAt: 'asc' },
            }),
            this.prisma.content.count({ where }),
        ]);
        return (0, paginated_result_dto_1.createPaginatedResult)(items, total, page, limit);
    }
    async approve(contentId, actorId, dto) {
        const content = await this.prisma.content.findFirst({
            where: { id: contentId, deletedAt: null },
        });
        if (!content)
            throw new common_1.NotFoundException('Content not found.');
        if (content.status !== client_1.ContentStatus.PENDING_REVIEW) {
            throw new common_1.BadRequestException(`Cannot approve content with status ${content.status}. Must be PENDING_REVIEW.`);
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.content.update({
                where: { id: contentId },
                data: { status: client_1.ContentStatus.APPROVED },
            });
            await tx.reviewEvent.create({
                data: {
                    contentId,
                    actorId,
                    action: client_1.ReviewAction.APPROVED,
                    fromStatus: client_1.ContentStatus.PENDING_REVIEW,
                    toStatus: client_1.ContentStatus.APPROVED,
                    note: dto.note,
                },
            });
            await tx.notification.create({
                data: {
                    userId: content.authorId,
                    type: client_1.NotificationType.CONTENT_APPROVED,
                    title: 'Content Approved',
                    message: `Your content "${content.title}" has been approved! It is ready for publication.`,
                },
            });
            return updated;
        });
    }
    async publish(contentId, actorId, dto) {
        const content = await this.prisma.content.findFirst({
            where: { id: contentId, deletedAt: null },
        });
        if (!content)
            throw new common_1.NotFoundException('Content not found.');
        const allowed = [
            client_1.ContentStatus.PENDING_REVIEW,
            client_1.ContentStatus.APPROVED,
            client_1.ContentStatus.UNPUBLISHED,
        ];
        if (!allowed.includes(content.status)) {
            throw new common_1.BadRequestException(`Cannot publish content with status ${content.status}.`);
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.content.update({
                where: { id: contentId },
                data: {
                    status: client_1.ContentStatus.PUBLISHED,
                    publishedAt: new Date(),
                },
            });
            await tx.reviewEvent.create({
                data: {
                    contentId,
                    actorId,
                    action: client_1.ReviewAction.PUBLISHED,
                    fromStatus: content.status,
                    toStatus: client_1.ContentStatus.PUBLISHED,
                    note: dto.note,
                },
            });
            await tx.notification.create({
                data: {
                    userId: content.authorId,
                    type: client_1.NotificationType.CONTENT_PUBLISHED,
                    title: 'Content Published',
                    message: `Your content "${content.title}" is now LIVE!`,
                },
            });
            return updated;
        });
    }
    async reject(contentId, actorId, dto) {
        const content = await this.prisma.content.findFirst({
            where: { id: contentId, deletedAt: null },
        });
        if (!content)
            throw new common_1.NotFoundException('Content not found.');
        if (content.status !== client_1.ContentStatus.PENDING_REVIEW) {
            throw new common_1.BadRequestException(`Cannot reject content with status ${content.status}.`);
        }
        if (!dto.note || dto.note.trim() === '') {
            throw new common_1.BadRequestException('A reason note is required when rejecting content.');
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.content.update({
                where: { id: contentId },
                data: { status: client_1.ContentStatus.REJECTED },
            });
            await tx.reviewEvent.create({
                data: {
                    contentId,
                    actorId,
                    action: client_1.ReviewAction.REJECTED,
                    fromStatus: client_1.ContentStatus.PENDING_REVIEW,
                    toStatus: client_1.ContentStatus.REJECTED,
                    note: dto.note,
                },
            });
            await tx.notification.create({
                data: {
                    userId: content.authorId,
                    type: client_1.NotificationType.CONTENT_REJECTED,
                    title: 'Content Rejected',
                    message: `Your content "${content.title}" has been rejected. Reason: ${dto.note}`,
                },
            });
            return updated;
        });
    }
    async requestChanges(contentId, actorId, dto) {
        const content = await this.prisma.content.findFirst({
            where: { id: contentId, deletedAt: null },
        });
        if (!content)
            throw new common_1.NotFoundException('Content not found.');
        if (content.status !== client_1.ContentStatus.PENDING_REVIEW) {
            throw new common_1.BadRequestException(`Cannot request changes for content with status ${content.status}.`);
        }
        if (!dto.note || dto.note.trim() === '') {
            throw new common_1.BadRequestException('A reason note is required when requesting changes.');
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.content.update({
                where: { id: contentId },
                data: { status: client_1.ContentStatus.CHANGES_REQUESTED },
            });
            await tx.reviewEvent.create({
                data: {
                    contentId,
                    actorId,
                    action: client_1.ReviewAction.CHANGES_REQUESTED,
                    fromStatus: client_1.ContentStatus.PENDING_REVIEW,
                    toStatus: client_1.ContentStatus.CHANGES_REQUESTED,
                    note: dto.note,
                },
            });
            await tx.notification.create({
                data: {
                    userId: content.authorId,
                    type: client_1.NotificationType.CONTENT_CHANGES_REQUESTED,
                    title: 'Changes Requested',
                    message: `Changes were requested on your content "${content.title}". Note: ${dto.note}`,
                },
            });
            return updated;
        });
    }
    async unpublish(contentId, actorId, dto) {
        const content = await this.prisma.content.findFirst({
            where: { id: contentId, deletedAt: null },
        });
        if (!content)
            throw new common_1.NotFoundException('Content not found.');
        if (content.status !== client_1.ContentStatus.PUBLISHED) {
            throw new common_1.BadRequestException(`Cannot unpublish content with status ${content.status}. Must be PUBLISHED.`);
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.content.update({
                where: { id: contentId },
                data: { status: client_1.ContentStatus.UNPUBLISHED },
            });
            await tx.reviewEvent.create({
                data: {
                    contentId,
                    actorId,
                    action: client_1.ReviewAction.UNPUBLISHED,
                    fromStatus: client_1.ContentStatus.PUBLISHED,
                    toStatus: client_1.ContentStatus.UNPUBLISHED,
                    note: dto.note,
                },
            });
            await tx.notification.create({
                data: {
                    userId: content.authorId,
                    type: client_1.NotificationType.CONTENT_UNPUBLISHED,
                    title: 'Content Unpublished',
                    message: `Your content "${content.title}" was unpublished.`,
                },
            });
            return updated;
        });
    }
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewService);
//# sourceMappingURL=review.service.js.map