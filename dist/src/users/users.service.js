"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const paginated_result_dto_1 = require("../common/dto/paginated-result.dto");
const pagination_util_1 = require("../common/utils/pagination.util");
const client_1 = require("@prisma/client");
const USER_SAFE_SELECT = {
    id: true,
    name: true,
    email: true,
    role: true,
    avatarUrl: true,
    bio: true,
    website: true,
    linkedin: true,
    twitter: true,
    emailVerifiedAt: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
};
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { page, limit, search, role, sortOrder, isActive } = query;
        const { skip, take } = (0, pagination_util_1.getPrismaSkipTake)(page, limit);
        const where = {
            deletedAt: null,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(role && { role }),
            ...(isActive !== undefined && { isActive }),
        };
        const orderBy = { createdAt: sortOrder ?? 'desc' };
        const [items, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    ...USER_SAFE_SELECT,
                    deletedAt: true,
                    subscriptions: {
                        where: { status: client_1.SubscriptionStatus.ACTIVE },
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                    },
                },
                skip,
                take,
                orderBy,
            }),
            this.prisma.user.count({ where }),
        ]);
        return (0, paginated_result_dto_1.createPaginatedResult)(items, total, page, limit);
    }
    async findById(id) {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
            select: USER_SAFE_SELECT,
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found.');
        }
        return user;
    }
    async getMyProfile(userId) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, deletedAt: null },
            select: {
                ...USER_SAFE_SELECT,
                subscriptions: {
                    where: { status: client_1.SubscriptionStatus.ACTIVE },
                    take: 1,
                    orderBy: { endDate: 'desc' },
                    include: { plan: true },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found.');
        }
        return user;
    }
    async updateProfile(userId, dto) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, deletedAt: null },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found.');
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.bio !== undefined && { bio: dto.bio }),
                ...(dto.website !== undefined && { website: dto.website }),
                ...(dto.linkedin !== undefined && { linkedin: dto.linkedin }),
                ...(dto.twitter !== undefined && { twitter: dto.twitter }),
                ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
            },
            select: USER_SAFE_SELECT,
        });
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, deletedAt: null },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found.');
        }
        const valid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!valid) {
            throw new common_1.BadRequestException('Current password is incorrect.');
        }
        if (dto.currentPassword === dto.newPassword) {
            throw new common_1.BadRequestException('New password must be different from the current password.');
        }
        const hashed = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashed },
        });
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return { message: 'Password changed successfully. Please log in again.' };
    }
    async adminUpdateUser(id, dto) {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found.');
        }
        return this.prisma.user.update({
            where: { id },
            data: {
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                ...(dto.role && { role: dto.role }),
            },
            select: USER_SAFE_SELECT,
        });
    }
    async softDelete(adminId, targetUserId) {
        if (adminId === targetUserId) {
            throw new common_1.ForbiddenException('You cannot delete your own account.');
        }
        const user = await this.prisma.user.findFirst({
            where: { id: targetUserId, deletedAt: null },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found.');
        }
        await this.prisma.user.update({
            where: { id: targetUserId },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });
        return { message: 'User account has been deactivated.' };
    }
    async hasActiveSubscription(userId) {
        const now = new Date();
        const sub = await this.prisma.subscription.findFirst({
            where: {
                userId,
                status: client_1.SubscriptionStatus.ACTIVE,
                startDate: { lte: now },
                endDate: { gte: now },
            },
        });
        return !!sub;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map