import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ArticlesService } from './articles.service';
import {
  CreateArticleDto,
  UpdateArticleDto,
  UpdateArticleStatusDto,
  ArticleQueryDto,
} from './dto/articles.dto';
import { Public, Cacheable, Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @Public()
  @Get()
  @Cacheable(300)
  @ApiOperation({ summary: 'List published articles (public)' })
  findAll(@Query() query: ArticleQueryDto) {
    return this.articlesService.findAll(query);
  }

  @Get('my-submissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user submissions' })
  mySubmissions(
    @CurrentUser('sub') userId: string,
    @Query() query: ArticleQueryDto,
  ) {
    return this.articlesService.mySubmissions(userId, query);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all articles for admin/editor review' })
  findAdmin(@Query() query: ArticleQueryDto) {
    return this.articlesService.findAll(query, UserRole.ADMIN);
  }

  @Get('detail/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get article by ID (authenticated)' })
  findById(@Param('id') id: string) {
    return this.articlesService.findById(id);
  }

  @Public()
  @Get(':slug')
  @Cacheable(300)
  @ApiOperation({ summary: 'Get article by slug (public)' })
  findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create / submit article' })
  create(@Body() dto: CreateArticleDto, @CurrentUser('sub') userId: string) {
    return this.articlesService.create(
      { ...dto, submit: dto.submit ?? false },
      userId,
    );
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update article' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.articlesService.update(id, dto, userId, role);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transition article status (review workflow)' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateArticleStatusDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.articlesService.updateStatus(id, dto, userId, role);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete article' })
  remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.articlesService.softDelete(id, userId, role);
  }
}
