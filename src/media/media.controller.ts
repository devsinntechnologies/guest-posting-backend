import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { MediaService } from './media.service';
import { MediaQueryDto, UpdateMediaDto } from './dto/media.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Upload a media file (image, PDF, video, document).
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: undefined })) // Buffer mode
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a media file' })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.mediaService.upload(file, user.sub);
  }

  /**
   * List media. ADMIN sees all; USER sees own uploads.
   */
  @Get()
  @ApiOperation({ summary: 'List media files' })
  findAll(@Query() query: MediaQueryDto, @CurrentUser() user: JwtPayload) {
    return this.mediaService.findAll(query, user.sub, user.role);
  }

  /**
   * Get a single media item by ID.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a media item by ID' })
  @ApiParam({ name: 'id', description: 'Media UUID' })
  findById(@Param('id') id: string) {
    return this.mediaService.findById(id);
  }

  /**
   * Update media alt text.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update media alt text' })
  @ApiParam({ name: 'id', description: 'Media UUID' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateMediaDto,
  ) {
    return this.mediaService.update(id, user.sub, user.role, dto);
  }

  /**
   * Delete a media item (soft delete + physical removal).
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a media item' })
  @ApiParam({ name: 'id', description: 'Media UUID' })
  delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.mediaService.delete(id, user.sub, user.role);
  }
}
