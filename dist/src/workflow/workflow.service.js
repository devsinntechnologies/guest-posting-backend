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
exports.WorkflowService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const workflow_state_machine_1 = require("./workflow.state-machine");
let WorkflowService = class WorkflowService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async transition(dto) {
        const article = await this.prisma.article.findFirst({
            where: { id: dto.articleId, deletedAt: null },
        });
        if (!article) {
            throw new common_1.NotFoundException('Article not found');
        }
        (0, workflow_state_machine_1.assertValidTransition)(article.status, dto.toStatus);
        if (dto.toStatus === client_1.ArticleStatus.REJECTED && !dto.rejectionReason) {
            throw new Error('Rejection reason is required');
        }
        if (dto.toStatus === client_1.ArticleStatus.APPROVED &&
            !article.categoryId &&
            !dto.categoryId) {
            throw new Error('Category must be assigned before approval');
        }
        const updateData = {
            status: dto.toStatus,
        };
        if (dto.rejectionReason) {
            updateData.rejectionReason = dto.rejectionReason;
        }
        if (dto.categoryId) {
            updateData.categoryId = dto.categoryId;
        }
        if (dto.toStatus === client_1.ArticleStatus.PUBLISHED) {
            updateData.publishedAt = new Date();
        }
        const [updated] = await this.prisma.$transaction([
            this.prisma.article.update({
                where: { id: dto.articleId },
                data: updateData,
                include: {
                    author: { select: { id: true, name: true, email: true } },
                    category: true,
                },
            }),
            this.prisma.submissionLog.create({
                data: {
                    articleId: dto.articleId,
                    actorId: dto.actorId,
                    fromStatus: article.status,
                    toStatus: dto.toStatus,
                    note: dto.note || dto.rejectionReason,
                },
            }),
        ]);
        return updated;
    }
    async getHistory(articleId) {
        return this.prisma.submissionLog.findMany({
            where: { articleId },
            include: {
                actor: { select: { id: true, name: true, email: true, role: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.WorkflowService = WorkflowService;
exports.WorkflowService = WorkflowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkflowService);
//# sourceMappingURL=workflow.service.js.map