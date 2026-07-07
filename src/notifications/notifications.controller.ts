import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationQueryDto } from './dto/notification.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Get own notifications.
   */
  @Get()
  @ApiOperation({ summary: 'USER — Get own notifications' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationsService.findAll(user.sub, query);
  }

  /**
   * Mark all user notifications as read.
   */
  @Patch('read-all')
  @ApiOperation({ summary: 'USER — Mark all notifications as read' })
  markAllAsRead(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.markAllAsRead(user.sub);
  }

  /**
   * Mark a notification as read.
   */
  @Patch(':id/read')
  @ApiOperation({ summary: 'USER — Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  markAsRead(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.notificationsService.markAsRead(id, user.sub);
  }

  /**
   * Delete a notification.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'USER — Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.notificationsService.delete(id, user.sub);
  }
}
