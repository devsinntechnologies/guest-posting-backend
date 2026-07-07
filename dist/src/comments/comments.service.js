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
const client_1 = require("@prisma/client");
const paginated_result_dto_1 = require("../common/dto/paginated-result.dto");
const pagination_util_1 = require("../common/utils/pagination.util");
let CommentsService = class CommentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(contentId, userId, dto) {
        const content = await this.prisma.content.findFirst({
            where: { id: contentId, deletedAt: null },
        });
        if (!content) {
            throw new common_1.NotFoundException('Content not found.');
        }
        if (content.status !== client_1.ContentStatus.PUBLISHED) {
            throw new common_1.BadRequestException('You can only comment on published content.');
        }
        return this.prisma.comment.create({
            data: {
                contentId,
                userId,
                body: dto.body,
                status: client_1.CommentStatus.VISIBLE,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }
    async findByContent(contentId, query) {
        const { page, limit } = query;
        const { skip, take } = (0, pagination_util_1.getPrismaSkipTake)(page, limit);
        const where = {
            contentId,
            status: client_1.CommentStatus.VISIBLE,
            deletedAt: null,
        };
        const [items, total] = await Promise.all([
            this.prisma.comment.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true,
                        },
                    },
                },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.comment.count({ where }),
        ]);
        return (0, paginated_result_dto_1.createPaginatedResult)(items, total, page, limit);
    }
    async hide(id) {
        const comment = await this.prisma.comment.findFirst({
            where: { id, deletedAt: null },
        });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found.');
        }
        return this.prisma.comment.update({
            where: { id },
            data: { status: client_1.CommentStatus.HIDDEN },
        });
    }
    async delete(id) {
        const comment = await this.prisma.comment.findUnique({
            where: { id },
        });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found.');
        }
        await this.prisma.comment.delete({
            where: { id },
        });
        return { message: 'Comment deleted successfully.' };
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommentsService);
//# sourceMappingURL=comments.service.js.map