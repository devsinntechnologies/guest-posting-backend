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
exports.LikesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LikesService = class LikesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async toggleLike(contentId, userId) {
        const content = await this.prisma.content.findFirst({
            where: { id: contentId, deletedAt: null },
        });
        if (!content) {
            throw new common_1.NotFoundException('Content not found.');
        }
        const existingLike = await this.prisma.like.findUnique({
            where: {
                contentId_userId: {
                    contentId,
                    userId,
                },
            },
        });
        if (existingLike) {
            await this.prisma.like.delete({
                where: {
                    contentId_userId: {
                        contentId,
                        userId,
                    },
                },
            });
            return { liked: false };
        }
        else {
            await this.prisma.like.create({
                data: {
                    contentId,
                    userId,
                },
            });
            return { liked: true };
        }
    }
    async getLikesInfo(contentId, userId) {
        const content = await this.prisma.content.findFirst({
            where: { id: contentId, deletedAt: null },
        });
        if (!content) {
            throw new common_1.NotFoundException('Content not found.');
        }
        const [count, userLike] = await Promise.all([
            this.prisma.like.count({
                where: { contentId },
            }),
            userId
                ? this.prisma.like.findUnique({
                    where: {
                        contentId_userId: {
                            contentId,
                            userId,
                        },
                    },
                })
                : null,
        ]);
        return {
            count,
            liked: !!userLike,
        };
    }
};
exports.LikesService = LikesService;
exports.LikesService = LikesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LikesService);
//# sourceMappingURL=likes.service.js.map