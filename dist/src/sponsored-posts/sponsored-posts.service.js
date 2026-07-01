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
exports.SponsoredPostsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let SponsoredPostsService = class SponsoredPostsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (0, pagination_dto_1.getSkip)(page, limit);
        const [items, total] = await Promise.all([
            this.prisma.sponsoredPost.findMany({
                skip,
                take: limit,
                include: {
                    article: { select: { id: true, title: true, slug: true } },
                    user: { select: { id: true, name: true } },
                },
                orderBy: { startDate: 'desc' },
            }),
            this.prisma.sponsoredPost.count(),
        ]);
        return (0, pagination_dto_1.paginate)(items, total, page, limit);
    }
    async findActive(placement) {
        const now = new Date();
        return this.prisma.sponsoredPost.findMany({
            where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
                ...(placement ? { placement: placement } : {}),
            },
            include: {
                article: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        featuredImageUrl: true,
                        excerpt: true,
                    },
                },
            },
        });
    }
    async create(dto, userId) {
        return this.prisma.sponsoredPost.create({
            data: {
                articleId: dto.articleId,
                userId,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                placement: dto.placement,
                isActive: dto.isActive ?? true,
            },
            include: { article: true },
        });
    }
    async update(id, dto) {
        const post = await this.prisma.sponsoredPost.findUnique({ where: { id } });
        if (!post)
            throw new common_1.NotFoundException('Sponsored post not found');
        return this.prisma.sponsoredPost.update({
            where: { id },
            data: {
                ...(dto.startDate ? { startDate: new Date(dto.startDate) } : {}),
                ...(dto.endDate ? { endDate: new Date(dto.endDate) } : {}),
                ...(dto.placement ? { placement: dto.placement } : {}),
                ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
            },
        });
    }
    async remove(id) {
        const post = await this.prisma.sponsoredPost.findUnique({ where: { id } });
        if (!post)
            throw new common_1.NotFoundException('Sponsored post not found');
        return this.prisma.sponsoredPost.delete({ where: { id } });
    }
};
exports.SponsoredPostsService = SponsoredPostsService;
exports.SponsoredPostsService = SponsoredPostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SponsoredPostsService);
//# sourceMappingURL=sponsored-posts.service.js.map