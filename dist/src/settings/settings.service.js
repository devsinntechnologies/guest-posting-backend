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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPublicSettings() {
        const settings = await this.prisma.siteSetting.findMany({
            where: { isPublic: true },
            select: {
                key: true,
                value: true,
                label: true,
                group: true,
            },
        });
        return settings.reduce((acc, s) => {
            acc[s.key] = s.value;
            return acc;
        }, {});
    }
    async getSettingByKey(key) {
        const setting = await this.prisma.siteSetting.findUnique({
            where: { key },
        });
        if (!setting) {
            throw new common_1.NotFoundException(`Setting with key "${key}" not found.`);
        }
        return setting;
    }
    async getAllSettings() {
        return this.prisma.siteSetting.findMany({
            orderBy: { key: 'asc' },
        });
    }
    async updateSetting(key, dto) {
        return this.prisma.siteSetting.upsert({
            where: { key },
            update: {
                value: dto.value,
                ...(dto.label !== undefined && { label: dto.label }),
                ...(dto.group !== undefined && { group: dto.group }),
                ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
            },
            create: {
                key,
                value: dto.value,
                label: dto.label || key,
                group: dto.group || 'general',
                isPublic: dto.isPublic ?? false,
            },
        });
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map