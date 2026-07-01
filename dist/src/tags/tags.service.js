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
exports.TagsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const slug_util_1 = require("../common/utils/slug.util");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const client_1 = require("@prisma/client");
let TagsService = class TagsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (0, pagination_dto_1.getSkip)(page, limit);
        const [items, total] = await Promise.all([
            this.prisma.tag.findMany({
                skip,
                take: limit,
                include: { _count: { select: { articleTags: true } } },
                orderBy: { name: 'asc' },
            }),
            this.prisma.tag.count(),
        ]);
        return (0, pagination_dto_1.paginate)(items, total, page, limit);
    }
    async findBySlug(slug) {
        const tag = await this.prisma.tag.findUnique({
            where: { slug },
            include: { _count: { select: { articleTags: true } } },
        });
        if (!tag)
            throw new common_1.NotFoundException('Tag not found');
        return tag;
    }
    async create(dto) {
        const baseSlug = (0, slug_util_1.generateSlug)(dto.name);
        const slug = await (0, slug_util_1.ensureUniqueSlug)(baseSlug, async (s) => {
            return !!(await this.prisma.tag.findUnique({ where: { slug: s } }));
        });
        return this.prisma.tag.create({ data: { name: dto.name, slug } });
    }
    async update(id, dto) {
        const tag = await this.prisma.tag.findUnique({ where: { id } });
        if (!tag)
            throw new common_1.NotFoundException('Tag not found');
        const baseSlug = (0, slug_util_1.generateSlug)(dto.name);
        const slug = await (0, slug_util_1.ensureUniqueSlug)(baseSlug, async (s) => !!(await this.prisma.tag.findUnique({ where: { slug: s } })), tag.slug);
        return this.prisma.tag.update({
            where: { id },
            data: { name: dto.name, slug },
        });
    }
    async remove(id, role) {
        if (role !== client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Only super admins can delete tags');
        }
        const tag = await this.prisma.tag.findUnique({ where: { id } });
        if (!tag)
            throw new common_1.NotFoundException('Tag not found');
        return this.prisma.tag.delete({ where: { id } });
    }
};
exports.TagsService = TagsService;
exports.TagsService = TagsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TagsService);
//# sourceMappingURL=tags.service.js.map