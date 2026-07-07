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
exports.NewsletterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const paginated_result_dto_1 = require("../common/dto/paginated-result.dto");
const pagination_util_1 = require("../common/utils/pagination.util");
let NewsletterService = class NewsletterService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async subscribe(dto) {
        const existing = await this.prisma.newsletterSubscriber.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (existing) {
            if (existing.isActive) {
                return { message: 'You are already subscribed to our newsletter.' };
            }
            await this.prisma.newsletterSubscriber.update({
                where: { id: existing.id },
                data: {
                    isActive: true,
                    name: dto.name || existing.name,
                    unsubscribedAt: null,
                },
            });
            return { message: 'Subscription successfully re-activated!' };
        }
        await this.prisma.newsletterSubscriber.create({
            data: {
                email: dto.email.toLowerCase(),
                name: dto.name,
                isActive: true,
            },
        });
        return { message: 'Thank you for subscribing to our newsletter!' };
    }
    async unsubscribe(token) {
        const subscriber = await this.prisma.newsletterSubscriber.findUnique({
            where: { unsubscribeToken: token },
        });
        if (!subscriber) {
            throw new common_1.NotFoundException('Invalid unsubscribe token.');
        }
        if (!subscriber.isActive) {
            return { message: 'You have already unsubscribed.' };
        }
        await this.prisma.newsletterSubscriber.update({
            where: { id: subscriber.id },
            data: {
                isActive: false,
                unsubscribedAt: new Date(),
            },
        });
        return { message: 'You have been successfully unsubscribed from our newsletter.' };
    }
    async findAll(query) {
        const { page, limit } = query;
        const { skip, take } = (0, pagination_util_1.getPrismaSkipTake)(page, limit);
        const [items, total] = await Promise.all([
            this.prisma.newsletterSubscriber.findMany({
                skip,
                take,
                orderBy: { subscribedAt: 'desc' },
            }),
            this.prisma.newsletterSubscriber.count(),
        ]);
        return (0, paginated_result_dto_1.createPaginatedResult)(items, total, page, limit);
    }
};
exports.NewsletterService = NewsletterService;
exports.NewsletterService = NewsletterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NewsletterService);
//# sourceMappingURL=newsletter.service.js.map