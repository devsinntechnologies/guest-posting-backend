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
import { ContentService } from './content.service';
import {
  AdminContentQueryDto,
  ContentQueryDto,
  CreateContentDto,
  SubmitContentDto,
  UpdateContentDto,
} from './dto/content.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { Public, Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SubscriptionGuard } from '../common/guards/subscription.guard';

@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // ─── Public Routes ────────────────────────────────────────────────────────

  @Get()
  @Public()
  @ApiOperation({ summary: 'Public — List published content' })
  findPublished(@Query() query: ContentQueryDto) {
    return this.contentService.findPublished(query);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Public — Get published content by slug' })
  @ApiParam({ name: 'slug', description: 'Content slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.contentService.findBySlug(slug);
  }

  // ─── Authenticated User Routes ────────────────────────────────────────────

  /**
   * Create a new content draft.
   * Requires an ACTIVE subscription.
   */
  @Post()
  @ApiBearerAuth()
  @UseGuards(SubscriptionGuard)
  @ApiOperation({ summary: 'USER — Create new content draft (requires subscription)' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateContentDto) {
    return this.contentService.create(user.sub, dto);
  }

  /**
   * List own content (all statuses).
   */
  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'USER — List own content across all statuses' })
  findMy(@CurrentUser() user: JwtPayload, @Query() query: ContentQueryDto) {
    return this.contentService.findMyContent(user.sub, query);
  }

  /**
   * Update own DRAFT or CHANGES_REQUESTED content.
   */
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'USER — Update own draft content' })
  @ApiParam({ name: 'id', description: 'Content UUID' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateContentDto,
  ) {
    return this.contentService.update(id, user.sub, dto);
  }

  /**
   * Submit own DRAFT for review.
   */
  @Post(':id/submit')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'USER — Submit draft for admin review' })
  @ApiParam({ name: 'id', description: 'Content UUID' })
  submit(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitContentDto,
  ) {
    return this.contentService.submit(id, user.sub, dto);
  }

  /**
   * Resubmit content after changes were requested.
   */
  @Post(':id/resubmit')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'USER — Resubmit content after changes requested' })
  @ApiParam({ name: 'id', description: 'Content UUID' })
  resubmit(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitContentDto,
  ) {
    return this.contentService.resubmit(id, user.sub, dto);
  }

  /**
   * Delete own DRAFT content.
   */
  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'USER — Delete own draft content' })
  @ApiParam({ name: 'id', description: 'Content UUID' })
  delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.contentService.delete(id, user.sub);
  }

  // ─── ADMIN Routes ─────────────────────────────────────────────────────────

  @Get('admin/all')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN — List all content with filters' })
  findAllAdmin(@Query() query: AdminContentQueryDto) {
    return this.contentService.findAllAdmin(query);
  }

  @Get(':id/review-history')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN — Get review history for a content item' })
  @ApiParam({ name: 'id', description: 'Content UUID' })
  getReviewHistory(@Param('id') id: string) {
    return this.contentService.getReviewHistory(id);
  }

  @Delete('admin/:id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ADMIN — Remove content (soft delete)' })
  @ApiParam({ name: 'id', description: 'Content UUID' })
  adminDelete(@Param('id') id: string) {
    return this.contentService.adminDelete(id);
  }

  /**
   * Get a specific content item by ID (owner or admin).
   */
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get content by ID (owner or ADMIN)' })
  @ApiParam({ name: 'id', description: 'Content UUID' })
  findById(@Param('id') id: string) {
    return this.contentService.findById(id);
  }
}
