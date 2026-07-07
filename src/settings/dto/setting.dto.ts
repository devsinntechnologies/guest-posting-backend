import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSettingDto {
  @ApiProperty({ example: 'https://facebook.com/devsinn' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ example: 'Facebook URL' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ example: 'social' })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
