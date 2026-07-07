import { PrismaService } from '../prisma/prisma.service';
import type { StorageProvider } from './interfaces/storage-provider.interface';
import { MediaQueryDto, UpdateMediaDto } from './dto/media.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
export declare class MediaService {
    private readonly prisma;
    private readonly storage;
    constructor(prisma: PrismaService, storage: StorageProvider);
    upload(file: Express.Multer.File, uploadedById: string): Promise<{
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        fileName: string;
        originalName: string;
        mimeType: string;
        mediaType: import("@prisma/client").$Enums.MediaType;
        fileSize: number;
        width: number | null;
        height: number | null;
        altText: string | null;
        storageProvider: string;
        storageKey: string | null;
        uploadedById: string;
    }>;
    findAll(query: MediaQueryDto, userId: string, role: string): Promise<PaginatedResult<any>>;
    findById(id: string): Promise<{
        uploadedBy: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        fileName: string;
        originalName: string;
        mimeType: string;
        mediaType: import("@prisma/client").$Enums.MediaType;
        fileSize: number;
        width: number | null;
        height: number | null;
        altText: string | null;
        storageProvider: string;
        storageKey: string | null;
        uploadedById: string;
    }>;
    update(id: string, userId: string, role: string, dto: UpdateMediaDto): Promise<{
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        fileName: string;
        originalName: string;
        mimeType: string;
        mediaType: import("@prisma/client").$Enums.MediaType;
        fileSize: number;
        width: number | null;
        height: number | null;
        altText: string | null;
        storageProvider: string;
        storageKey: string | null;
        uploadedById: string;
    }>;
    delete(id: string, userId: string, role: string): Promise<{
        message: string;
    }>;
}
