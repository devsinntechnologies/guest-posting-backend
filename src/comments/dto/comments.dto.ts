import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommentStatus } from '@prisma/client';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;

  @ApiPropertyOptional()
  @ValidateIf((_o, value) => value !== undefined)
  @IsString()
  guestName?: string;

  @ApiPropertyOptional()
  @ValidateIf((_o, value) => value !== undefined)
  @IsEmail()
  guestEmail?: string;
}

export class ModerateCommentDto {
  @ApiProperty({ enum: CommentStatus })
  @IsEnum(CommentStatus)
  status: CommentStatus;
}
