import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SeoService } from './seo.service';
import {
  CreateSeoPageDto,
  BulkGenerateSeoDto,
  SeoPageQueryDto,
  UpdateSeoMetaDto,
} from './dto/seo.dto';
import { Public, Roles, Cacheable } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('SEO')
@Controller('seo')
export class SeoController {
  constructor(private seoService: SeoService) {}

  @Public()
  @Get('pages')
  @Cacheable(600)
  @ApiOperation({ summary: 'List SEO pages' })
  findAll(@Query() query: SeoPageQueryDto) {
    return this.seoService.findAll(query);
  }

  @Public()
  @Get('pages/:slug')
  @Cacheable(600)
  @ApiOperation({ summary: 'Get SEO page by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.seoService.findBySlug(slug);
  }

  @Public()
  @Get('sitemap-data')
  @Cacheable(3600)
  @ApiOperation({ summary: 'Get sitemap data for published content' })
  getSitemapData() {
    return this.seoService.getSitemapData();
  }

  @Post('pages')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create SEO page' })
  create(@Body() dto: CreateSeoPageDto) {
    return this.seoService.create(dto);
  }

  @Post('pages/bulk-generate')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk generate programmatic SEO pages' })
  bulkGenerate(@Body() dto: BulkGenerateSeoDto) {
    return this.seoService.bulkGenerate(dto);
  }

  @Patch('pages/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update SEO page meta' })
  update(@Param('id') id: string, @Body() dto: UpdateSeoMetaDto) {
    return this.seoService.update(id, dto);
  }
}
