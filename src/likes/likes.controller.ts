import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/roles.decorator';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';

@ApiTags('Likes')
@Controller()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  /**
   * Toggle like/unlike on a content item.
   * USER only.
   */
  @Post('content/:contentId/like')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'USER — Toggle like on content' })
  @ApiParam({ name: 'contentId', description: 'Content UUID' })
  toggleLike(
    @Param('contentId') contentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.likesService.toggleLike(contentId, user.sub);
  }

  /**
   * Get like statistics for a content item.
   * Public (returns count, and if logged in, whether current user liked it).
   */
  @Get('content/:contentId/likes')
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Public — Get like count and toggle status' })
  @ApiParam({ name: 'contentId', description: 'Content UUID' })
  getLikes(
    @Param('contentId') contentId: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.likesService.getLikesInfo(contentId, user?.sub);
  }
}
