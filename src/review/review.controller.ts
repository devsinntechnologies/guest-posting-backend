import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { ReviewService } from './review.service';
import { ReviewActionDto, ReviewQueueQueryDto } from './dto/review.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Review Workflow')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * Get list of content pending review.
   */
  @Get('queue')
  @ApiOperation({ summary: 'ADMIN — Get review queue (pending review content)' })
  getQueue(@Query() query: ReviewQueueQueryDto) {
    return this.reviewService.getQueue(query);
  }

  /**
   * Approve draft content.
   */
  @Post(':contentId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ADMIN — Approve pending content draft' })
  @ApiParam({ name: 'contentId', description: 'Content UUID' })
  approve(
    @Param('contentId') contentId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ReviewActionDto,
  ) {
    return this.reviewService.approve(contentId, user.sub, dto);
  }

  /**
   * Publish content draft.
   */
  @Post(':contentId/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ADMIN — Publish content (make live)' })
  @ApiParam({ name: 'contentId', description: 'Content UUID' })
  publish(
    @Param('contentId') contentId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ReviewActionDto,
  ) {
    return this.reviewService.publish(contentId, user.sub, dto);
  }

  /**
   * Reject content draft. Note is required.
   */
  @Post(':contentId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ADMIN — Reject pending content draft' })
  @ApiParam({ name: 'contentId', description: 'Content UUID' })
  reject(
    @Param('contentId') contentId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ReviewActionDto,
  ) {
    return this.reviewService.reject(contentId, user.sub, dto);
  }

  /**
   * Request changes on a content draft. Note is required.
   */
  @Post(':contentId/request-changes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ADMIN — Request revisions on content draft' })
  @ApiParam({ name: 'contentId', description: 'Content UUID' })
  requestChanges(
    @Param('contentId') contentId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ReviewActionDto,
  ) {
    return this.reviewService.requestChanges(contentId, user.sub, dto);
  }

  /**
   * Unpublish content (Published -> Unpublished).
   */
  @Post(':contentId/unpublish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ADMIN — Unpublish content' })
  @ApiParam({ name: 'contentId', description: 'Content UUID' })
  unpublish(
    @Param('contentId') contentId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ReviewActionDto,
  ) {
    return this.reviewService.unpublish(contentId, user.sub, dto);
  }
}
