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
import { CommentsService } from './comments.service';
import { CreateCommentDto, CommentQueryDto } from './dto/comment.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { Public, Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * Submit a comment on a published content item.
   * USER only.
   */
  @Post('content/:contentId/comments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'USER — Add comment to content' })
  @ApiParam({ name: 'contentId', description: 'Content UUID' })
  create(
    @Param('contentId') contentId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commentsService.create(contentId, user.sub, dto);
  }

  /**
   * Get visible comments for a content item.
   */
  @Get('content/:contentId/comments')
  @Public()
  @ApiOperation({ summary: 'Public — Get visible comments' })
  @ApiParam({ name: 'contentId', description: 'Content UUID' })
  findByContent(
    @Param('contentId') contentId: string,
    @Query() query: CommentQueryDto,
  ) {
    return this.commentsService.findByContent(contentId, query);
  }

  /**
   * ADMIN: Hide a comment.
   */
  @Patch('comments/:id/hide')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN — Hide a comment' })
  @ApiParam({ name: 'id', description: 'Comment UUID' })
  hide(@Param('id') id: string) {
    return this.commentsService.hide(id);
  }

  /**
   * ADMIN: Hard delete a comment.
   */
  @Delete('comments/:id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ADMIN — Hard delete a comment' })
  @ApiParam({ name: 'id', description: 'Comment UUID' })
  delete(@Param('id') id: string) {
    return this.commentsService.delete(id);
  }
}
