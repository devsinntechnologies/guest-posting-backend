import { MediaService } from './media.service';
import { MediaQueryDto, UpdateMediaDto } from './dto/media.dto';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    upload(file: Express.Multer.File, user: JwtPayload): Promise<{
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
    findAll(query: MediaQueryDto, user: JwtPayload): Promise<import("../common/dto/paginated-result.dto").PaginatedResult<any>>;
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
    update(id: string, user: JwtPayload, dto: UpdateMediaDto): Promise<{
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
    delete(id: string, user: JwtPayload): Promise<{
        message: string;
    }>;
}
