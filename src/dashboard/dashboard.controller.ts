import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Get aggregate stats of the platform.
   * ADMIN only.
   */
  @Get('stats')
  @ApiOperation({ summary: 'ADMIN — Get aggregate dashboard statistics' })
  getStats() {
    return this.dashboardService.getAdminStats();
  }

  /**
   * Get recent activity logs.
   * ADMIN only.
   */
  @Get('recent-activity')
  @ApiOperation({ summary: 'ADMIN — Get recent review/audit activities' })
  getRecentActivity(@Query('limit') limit?: number) {
    const lim = limit ? Number(limit) : 15;
    return this.dashboardService.getRecentActivity(lim);
  }
}
