import { IsBoolean, IsDateString, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SponsoredPlacement } from '@prisma/client';

export class CreateSponsoredPostDto {
  @ApiProperty()
  @IsUUID()
  articleId: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ enum: SponsoredPlacement })
  @IsEnum(SponsoredPlacement)
  placement: SponsoredPlacement;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSponsoredPostDto {
  @ApiPropertyOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: SponsoredPlacement })
  @IsEnum(SponsoredPlacement)
  placement?: SponsoredPlacement;

  @ApiPropertyOptional()
  @IsBoolean()
  isActive?: boolean;
}
