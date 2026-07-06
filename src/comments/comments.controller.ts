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
import { CommentsService } from './comments.service';
import { CreateCommentDto, ModerateCommentDto } from './dto/comments.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Public, Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Comments')
@Controller()
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Public()
  @Get('articles/:articleId/comments')
  @ApiOperation({ summary: 'Get approved comments for article' })
  findByArticle(
    @Param('articleId') articleId: string,
    @Query() query: PaginationDto,
  ) {
    return this.commentsService.findByArticle(articleId, query);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Post('articles/:articleId/comments')
  @ApiOperation({ summary: 'Submit comment (guest or authenticated)' })
  create(
    @Param('articleId') articleId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('sub') userId: string | undefined,
  ) {
    return this.commentsService.create(articleId, dto, userId);
  }

  @Get('comments/pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List pending comments for moderation' })
  findPending(@Query() query: PaginationDto) {
    return this.commentsService.findPending(query);
  }

  @Patch('comments/:id/moderate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Moderate comment' })
  moderate(@Param('id') id: string, @Body() dto: ModerateCommentDto) {
    return this.commentsService.moderate(id, dto);
  }

  @Delete('comments/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete comment' })
  remove(@Param('id') id: string) {
    return this.commentsService.softDelete(id);
  }
}
