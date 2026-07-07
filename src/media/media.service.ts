import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MediaType, UserRole } from '@prisma/client';
import { Express } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_PROVIDER } from './interfaces/storage-provider.interface';
import type { StorageProvider } from './interfaces/storage-provider.interface';
import { MediaQueryDto, UpdateMediaDto } from './dto/media.dto';
import {
  createPaginatedResult,
  PaginatedResult,
} from '../common/dto/paginated-result.dto';
import { getPrismaSkipTake } from '../common/utils/pagination.util';

// Mime type to MediaType mapping
const MIME_TO_MEDIA_TYPE: Record<string, MediaType> = {
  'image/jpeg': MediaType.IMAGE,
  'image/png': MediaType.IMAGE,
  'image/gif': MediaType.IMAGE,
  'image/webp': MediaType.IMAGE,
  'image/svg+xml': MediaType.IMAGE,
  'video/mp4': MediaType.VIDEO,
  'video/webm': MediaType.VIDEO,
  'video/ogg': MediaType.VIDEO,
  'application/pdf': MediaType.PDF,
  'application/msword': MediaType.DOCUMENT,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    MediaType.DOCUMENT,
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  /**
   * Upload a media file and persist metadata.
   */
  async upload(
    file: Express.Multer.File,
    uploadedById: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided.');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds the 50 MB limit.');
    }

    const mediaType = MIME_TO_MEDIA_TYPE[file.mimetype];
    if (!mediaType) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}`,
      );
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

  /**
   * List all media (ADMIN) or own uploads (USER).
   */
  async findAll(
    query: MediaQueryDto,
    userId: string,
    role: string,
  ): Promise<PaginatedResult<any>> {
    const { page, limit, mediaType, search } = query;
    const { skip, take } = getPrismaSkipTake(page, limit);

    const where = {
      deletedAt: null,
      ...(role !== UserRole.ADMIN && { uploadedById: userId }),
      ...(mediaType && { mediaType }),
      ...(search && {
        originalName: { contains: search, mode: 'insensitive' as const },
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

    return createPaginatedResult(items, total, page, limit);
  }

  /**
   * Get a single media item by ID.
   */
  async findById(id: string) {
    const media = await this.prisma.media.findFirst({
      where: { id, deletedAt: null },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    });

    if (!media) {
      throw new NotFoundException('Media not found.');
    }

    return media;
  }

  /**
   * Update alt text.
   */
  async update(id: string, userId: string, role: string, dto: UpdateMediaDto) {
    const media = await this.prisma.media.findFirst({
      where: { id, deletedAt: null },
    });

    if (!media) {
      throw new NotFoundException('Media not found.');
    }

    if (role !== UserRole.ADMIN && media.uploadedById !== userId) {
      throw new ForbiddenException(
        'You can only update your own uploaded media.',
      );
    }

    return this.prisma.media.update({
      where: { id },
      data: { altText: dto.altText },
    });
  }

  /**
   * Soft-delete media. Physically removes from storage.
   */
  async delete(
    id: string,
    userId: string,
    role: string,
  ): Promise<{ message: string }> {
    const media = await this.prisma.media.findFirst({
      where: { id, deletedAt: null },
    });

    if (!media) {
      throw new NotFoundException('Media not found.');
    }

    if (role !== UserRole.ADMIN && media.uploadedById !== userId) {
      throw new ForbiddenException('You can only delete your own media.');
    }

    // Soft delete first
    await this.prisma.media.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Physical deletion from storage (non-blocking)
    if (media.storageKey) {
      this.storage.delete(media.storageKey).catch(() => {
        // Log error but don't fail the request
      });
    }

    return { message: 'Media deleted successfully.' };
  }
}
