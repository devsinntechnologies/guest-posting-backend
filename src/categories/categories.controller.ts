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
import { CategoriesService } from './categories.service';
import {
  CategoryQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';
import { Roles, Public } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * ADMIN: Create a new category.
   */
  @Post()
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN — Create a new category' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  /**
   * Public: List all active categories.
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Public — List active categories' })
  findAll(@Query() query: CategoryQueryDto) {
    return this.categoriesService.findAll(query, true);
  }

  /**
   * ADMIN: List all categories including inactive.
   */
  @Get('admin')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN — List all categories including inactive' })
  findAllAdmin(@Query() query: CategoryQueryDto) {
    return this.categoriesService.findAll(query, false);
  }

  /**
   * Public: Get category by slug.
   */
  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Public — Get category by slug' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  /**
   * Public: Get category by ID.
   */
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Public — Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  findById(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  /**
   * ADMIN: Update a category.
   */
  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN — Update a category' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  /**
   * ADMIN: Delete a category.
   */
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ADMIN — Delete a category' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
