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
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const client_1 = require("@prisma/client");
const sanitize_util_1 = require("../common/utils/sanitize.util");
let CommentsService = class CommentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByArticle(articleId, query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (0, pagination_dto_1.getSkip)(page, limit);
        const where = {
            articleId,
            status: client_1.CommentStatus.APPROVED,
            deletedAt: null,
            parentCommentId: null,
        };
        const [items, total] = await Promise.all([
            this.prisma.comment.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: { select: { id: true, name: true, avatarUrl: true } },
                    replies: {
                        where: { status: client_1.CommentStatus.APPROVED, deletedAt: null },
                        include: {
                            user: { select: { id: true, name: true, avatarUrl: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.comment.count({ where }),
        ]);
        return (0, pagination_dto_1.paginate)(items, total, page, limit);
    }
    async create(articleId, dto, userId) {
        const article = await this.prisma.article.findFirst({
            where: { id: articleId, deletedAt: null },
        });
        if (!article)
            throw new common_1.NotFoundException('Article not found');
        return this.prisma.comment.create({
            data: {
                articleId,
                userId,
                guestName: dto.guestName,
                guestEmail: dto.guestEmail,
                content: (0, sanitize_util_1.sanitizeContent)(dto.content),
                parentCommentId: dto.parentCommentId,
                status: client_1.CommentStatus.PENDING,
            },
        });
    }
    async moderate(id, dto) {
        const comment = await this.prisma.comment.findFirst({
            where: { id, deletedAt: null },
        });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        return this.prisma.comment.update({
            where: { id },
            data: { status: dto.status },
        });
    }
    async softDelete(id) {
        const comment = await this.prisma.comment.findFirst({
            where: { id, deletedAt: null },
        });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        return this.prisma.comment.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommentsService);
//# sourceMappingURL=comments.service.js.map