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
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SponsoredPostsService } from './sponsored-posts.service';
import {
  CreateSponsoredPostDto,
  UpdateSponsoredPostDto,
} from './dto/sponsored-posts.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Public, Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Sponsored Posts')
@Controller('sponsored-posts')
export class SponsoredPostsController {
  constructor(private sponsoredPostsService: SponsoredPostsService) {}

  @Public()
  @Get('active')
  @ApiOperation({ summary: 'Get active sponsored posts' })
  findActive(@Query('placement') placement?: string) {
    return this.sponsoredPostsService.findActive(placement);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all sponsored posts' })
  findAll(@Query() query: PaginationDto) {
    return this.sponsoredPostsService.findAll(query);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create sponsored post' })
  create(
    @Body() dto: CreateSponsoredPostDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.sponsoredPostsService.create(dto, userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update sponsored post' })
  update(@Param('id') id: string, @Body() dto: UpdateSponsoredPostDto) {
    return this.sponsoredPostsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete sponsored post' })
  remove(@Param('id') id: string) {
    return this.sponsoredPostsService.remove(id);
  }
}
