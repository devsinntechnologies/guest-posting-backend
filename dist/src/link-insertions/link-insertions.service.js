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
exports.LinkInsertionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const client_1 = require("@prisma/client");
let LinkInsertionsService = class LinkInsertionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query, userId, role) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (0, pagination_dto_1.getSkip)(page, limit);
        const where = role === client_1.UserRole.CONTRIBUTOR && userId ? { requestedById: userId } : {};
        const [items, total] = await Promise.all([
            this.prisma.linkInsertion.findMany({
                where,
                skip,
                take: limit,
                include: {
                    requestedBy: { select: { id: true, name: true, email: true } },
                    targetArticle: { select: { id: true, title: true, slug: true } },
                    payment: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.linkInsertion.count({ where }),
        ]);
        return (0, pagination_dto_1.paginate)(items, total, page, limit);
    }
    async create(dto, userId) {
        return this.prisma.linkInsertion.create({
            data: {
                requestedById: userId,
                targetArticleId: dto.targetArticleId,
                anchorText: dto.anchorText,
                destinationUrl: dto.destinationUrl,
                price: dto.price,
            },
            include: {
                targetArticle: { select: { id: true, title: true, slug: true } },
            },
        });
    }
    async updateStatus(id, dto) {
        const insertion = await this.prisma.linkInsertion.findUnique({
            where: { id },
        });
        if (!insertion)
            throw new common_1.NotFoundException('Link insertion not found');
        return this.prisma.linkInsertion.update({
            where: { id },
            data: {
                status: dto.status,
                ...(dto.paymentId ? { paymentId: dto.paymentId } : {}),
            },
        });
    }
};
exports.LinkInsertionsService = LinkInsertionsService;
exports.LinkInsertionsService = LinkInsertionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LinkInsertionsService);
//# sourceMappingURL=link-insertions.service.js.map