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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const storage_provider_interface_1 = require("./interfaces/storage-provider.interface");
const paginated_result_dto_1 = require("../common/dto/paginated-result.dto");
const pagination_util_1 = require("../common/utils/pagination.util");
const MIME_TO_MEDIA_TYPE = {
    'image/jpeg': client_1.MediaType.IMAGE,
    'image/png': client_1.MediaType.IMAGE,
    'image/gif': client_1.MediaType.IMAGE,
    'image/webp': client_1.MediaType.IMAGE,
    'image/svg+xml': client_1.MediaType.IMAGE,
    'video/mp4': client_1.MediaType.VIDEO,
    'video/webm': client_1.MediaType.VIDEO,
    'video/ogg': client_1.MediaType.VIDEO,
    'application/pdf': client_1.MediaType.PDF,
    'application/msword': client_1.MediaType.DOCUMENT,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': client_1.MediaType.DOCUMENT,
};
const MAX_FILE_SIZE = 50 * 1024 * 1024;
let MediaService = class MediaService {
    prisma;
    storage;
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
    }
    async upload(file, uploadedById) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided.');
        }
        if (file.size > MAX_FILE_SIZE) {
            throw new common_1.BadRequestException('File size exceeds the 50 MB limit.');
        }
        const mediaType = MIME_TO_MEDIA_TYPE[file.mimetype];
        if (!mediaType) {
            throw new common_1.BadRequestException(`Unsupported file type: ${file.mimetype}`);
        }
        const uploadResult = await this.storage.upload(file);
        return this.prisma.media.create({
            data: {
                fileName: uploadResult.fileName,
                originalName: uploadResult.originalName,
                url: uploadResult.url,
                mimeType: uploadResult.mimeType,
                mediaType,
                fileSize: uploadResult.fileSize,
                storageProvider: uploadResult.storageProvider,
                storageKey: uploadResult.storageKey,
                uploadedById,
            },
        });
    }
    async findAll(query, userId, role) {
        const { page, limit, mediaType, search } = query;
        const { skip, take } = (0, pagination_util_1.getPrismaSkipTake)(page, limit);
        const where = {
            deletedAt: null,
            ...(role !== client_1.UserRole.ADMIN && { uploadedById: userId }),
            ...(mediaType && { mediaType }),
            ...(search && {
                originalName: { contains: search, mode: 'insensitive' },
            }),
        };
        const [items, total] = await Promise.all([
            this.prisma.media.findMany({
                where,
                include: {
                    uploadedBy: { select: { id: true, name: true, email: true } },
                },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.media.count({ where }),
        ]);
        return (0, paginated_result_dto_1.createPaginatedResult)(items, total, page, limit);
    }
    async findById(id) {
        const media = await this.prisma.media.findFirst({
            where: { id, deletedAt: null },
            include: {
                uploadedBy: { select: { id: true, name: true } },
            },
        });
        if (!media) {
            throw new common_1.NotFoundException('Media not found.');
        }
        return media;
    }
    async update(id, userId, role, dto) {
        const media = await this.prisma.media.findFirst({
            where: { id, deletedAt: null },
        });
        if (!media) {
            throw new common_1.NotFoundException('Media not found.');
        }
        if (role !== client_1.UserRole.ADMIN && media.uploadedById !== userId) {
            throw new common_1.ForbiddenException('You can only update your own uploaded media.');
        }
        return this.prisma.media.update({
            where: { id },
            data: { altText: dto.altText },
        });
    }
    async delete(id, userId, role) {
        const media = await this.prisma.media.findFirst({
            where: { id, deletedAt: null },
        });
        if (!media) {
            throw new common_1.NotFoundException('Media not found.');
        }
        if (role !== client_1.UserRole.ADMIN && media.uploadedById !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own media.');
        }
        await this.prisma.media.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        if (media.storageKey) {
            this.storage.delete(media.storageKey).catch(() => {
            });
        }
        return { message: 'Media deleted successfully.' };
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(storage_provider_interface_1.STORAGE_PROVIDER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], MediaService);
//# sourceMappingURL=media.service.js.map