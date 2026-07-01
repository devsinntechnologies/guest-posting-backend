import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;
}

export class UpdateTagDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;
}
