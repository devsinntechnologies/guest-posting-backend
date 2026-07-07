import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlockType, ContentStatus, ContentType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

// ─── Content Block ──────────────────────────────────────────────────────────

export class CreateContentBlockDto {
  @ApiProperty({ enum: BlockType })
  @IsEnum(BlockType)
  type: BlockType;

  @ApiProperty({ description: 'Position/order index (0-based)' })
  @IsInt()
  @Min(0)
  position: number;

  @ApiPropertyOptional({ description: 'Text content for paragraph/heading/code/quote/list blocks' })
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiPropertyOptional({ description: 'Media UUID for image/video blocks' })
  @IsOptional()
  @IsUUID()
  mediaId?: string;

  @ApiPropertyOptional({ description: 'Extra block-specific metadata (e.g. heading level, list items)' })
  @IsOptional()
  metadata?: Record<string, unknown>;
}

// ─── Create Content ──────────────────────────────────────────────────────────

export class CreateContentDto {
  @ApiProperty({ example: 'How to Build Scalable APIs with NestJS' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ enum: ContentType, default: ContentType.ARTICLE })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @ApiPropertyOptional({ example: 'A comprehensive guide to...' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Primary category UUID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Cover image media UUID' })
  @IsOptional()
  @IsUUID()
  coverImageId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(70)
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  metaKeywords?: string;

  @ApiPropertyOptional({ type: [CreateContentBlockDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContentBlockDto)
  blocks?: CreateContentBlockDto[];
}

// ─── Update Content ──────────────────────────────────────────────────────────

export class UpdateContentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  coverImageId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(70)
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  metaKeywords?: string;

  @ApiPropertyOptional({ type: [CreateContentBlockDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContentBlockDto)
  blocks?: CreateContentBlockDto[];
}

// ─── Submit / Resubmit ───────────────────────────────────────────────────────

export class SubmitContentDto {
  @ApiPropertyOptional({ description: 'Optional note for the reviewer' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

// ─── Query ───────────────────────────────────────────────────────────────────

export class ContentQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ContentType })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @ApiPropertyOptional({ description: 'Filter by category UUID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Sort field', default: 'publishedAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class AdminContentQueryDto extends ContentQueryDto {
  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ description: 'Filter by author UUID' })
  @IsOptional()
  @IsUUID()
  authorId?: string;
}

// ─── Admin Publish ────────────────────────────────────────────────────────────

export class ReviewActionDto {
  @ApiPropertyOptional({ description: 'Required for REJECT and CHANGES_REQUESTED actions' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
