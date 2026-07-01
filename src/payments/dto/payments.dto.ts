import { IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutDto {
  @ApiProperty()
  @IsUUID()
  packageId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  articleId?: string;
}
