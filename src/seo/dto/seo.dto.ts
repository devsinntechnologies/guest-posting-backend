import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeoPageType } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateSeoPageDto {
  @ApiProperty({ enum: SeoPageType })
  @IsEnum(SeoPageType)
  pageType: SeoPageType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  h1Heading?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customContent?: string;
}

export class BulkGenerateSeoDto {
  @ApiProperty({ enum: SeoPageType, isArray: true })
  @IsEnum(SeoPageType, { each: true })
  pageTypes: SeoPageType[];
}

export class SeoPageQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: SeoPageType })
  @IsOptional()
  @IsEnum(SeoPageType)
  pageType?: SeoPageType;
}

export class UpdateSeoMetaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  h1Heading?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customContent?: string;
}
