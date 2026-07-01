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
exports.OwnershipGuard = exports.OwnershipCheck = exports.OWNERSHIP_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../decorators/roles.decorator");
exports.OWNERSHIP_KEY = 'ownership';
const OwnershipCheck = (resource) => (0, common_1.SetMetadata)(exports.OWNERSHIP_KEY, resource);
exports.OwnershipCheck = OwnershipCheck;
let OwnershipGuard = class OwnershipGuard {
    reflector;
    prisma;
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const resource = this.reflector.getAllAndOverride(exports.OWNERSHIP_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!resource)
            return true;
        const isPublic = this.reflector.getAllAndOverride(roles_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user)
            throw new common_1.ForbiddenException('Access denied');
        if (user.role === client_1.UserRole.SUPER_ADMIN || user.role === client_1.UserRole.EDITOR) {
            return true;
        }
        const id = request.params.id;
        if (!id)
            return true;
        if (resource === 'article') {
            const article = await this.prisma.article.findFirst({
                where: { id, deletedAt: null },
            });
            if (!article)
                throw new common_1.ForbiddenException('Article not found');
            if (article.authorId !== user.sub) {
                throw new common_1.ForbiddenException('You can only access your own articles');
            }
        }
        if (resource === 'order') {
            const order = await this.prisma.order.findUnique({ where: { id } });
            if (!order)
                throw new common_1.ForbiddenException('Order not found');
            if (order.userId !== user.sub) {
                throw new common_1.ForbiddenException('You can only access your own orders');
            }
        }
        return true;
    }
};
exports.OwnershipGuard = OwnershipGuard;
exports.OwnershipGuard = OwnershipGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], OwnershipGuard);
//# sourceMappingURL=ownership.guard.js.map