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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SeoService } from './seo.service';
import {
  CreateSeoPageDto,
  SeoPageQueryDto,
  UpdateSeoPageDto,
} from './dto/seo.dto';
import { Public, Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('SEO Meta')
@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  /**
   * List SEO pages (Public).
   */
  @Get('pages')
  @Public()
  @ApiOperation({ summary: 'Public — List all SEO metadata pages' })
  findAll(@Query() query: SeoPageQueryDto) {
    return this.seoService.findAll(query);
  }

  /**
   * Get SEO page config by slug.
   * Public.
   */
  @Get('pages/slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Public — Get SEO metadata by page slug' })
  @ApiParam({ name: 'slug', description: 'Page slug (e.g. contact-us)' })
  findBySlug(@Param('slug') slug: string) {
    return this.seoService.findBySlug(slug);
  }

  /**
   * Get Sitemap dataset.
   * Public.
   */
  @Get('sitemap')
  @Public()
  @ApiOperation({ summary: 'Public — Get sitemap data for XML generation' })
  getSitemapData() {
    return this.seoService.getSitemapData();
  }

  /**
   * Create an SEO page.
   * ADMIN only.
   */
  @Post('pages')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN — Create SEO page metadata' })
  create(@Body() dto: CreateSeoPageDto) {
    return this.seoService.create(dto);
  }

  /**
   * Update an SEO page.
   * ADMIN only.
   */
  @Patch('pages/:id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN — Update SEO page metadata' })
  @ApiParam({ name: 'id', description: 'SEO Page UUID' })
  update(@Param('id') id: string, @Body() dto: UpdateSeoPageDto) {
    return this.seoService.update(id, dto);
  }

  /**
   * Delete an SEO page.
   * ADMIN only.
   */
  @Delete('pages/:id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ADMIN — Delete SEO page metadata' })
  @ApiParam({ name: 'id', description: 'SEO Page UUID' })
  delete(@Param('id') id: string) {
    return this.seoService.delete(id);
  }
}
