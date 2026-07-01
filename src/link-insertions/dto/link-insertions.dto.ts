import { IsEnum, IsNumber, IsString, IsUrl, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LinkInsertionStatus } from '@prisma/client';

export class CreateLinkInsertionDto {
  @ApiProperty()
  @IsUUID()
  targetArticleId: string;

  @ApiProperty()
  @IsString()
  anchorText: string;

  @ApiProperty()
  @IsUrl()
  destinationUrl: string;

  @ApiProperty()
  @IsNumber()
  price: number;
}

export class UpdateLinkInsertionStatusDto {
  @ApiProperty({ enum: LinkInsertionStatus })
  @IsEnum(LinkInsertionStatus)
  status: LinkInsertionStatus;

  @ApiPropertyOptional()
  @IsUUID()
  paymentId?: string;
}
