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
import { SubscriptionsService } from './subscriptions.service';
import {
  AdminSubscriptionQueryDto,
  CreateSubscriptionPlanDto,
  SubscriptionPlanQueryDto,
  UpdateSubscriptionPlanDto,
} from './dto/subscription.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { Public, Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Subscriptions')
@Controller()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // ─── Plan Endpoints ────────────────────────────────────────────────────────

  /**
   * List all subscription plans.
   * Public.
   */
  @Get('subscription-plans')
  @Public()
  @ApiOperation({ summary: 'Public — List active subscription plans' })
  findAllPlans(@Query() query: SubscriptionPlanQueryDto) {
    return this.subscriptionsService.findAllPlans(query);
  }

  /**
   * Get subscription plan by ID.
   * Public.
   */
  @Get('subscription-plans/:id')
  @Public()
  @ApiOperation({ summary: 'Public — Get subscription plan details' })
  @ApiParam({ name: 'id', description: 'Plan UUID' })
  findPlanById(@Param('id') id: string) {
    return this.subscriptionsService.findPlanById(id);
  }

  /**
   * Create subscription plan.
   * ADMIN only.
   */
  @Post('subscription-plans')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN — Create new subscription plan' })
  createPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return this.subscriptionsService.createPlan(dto);
  }

  /**
   * Update subscription plan.
   * ADMIN only.
   */
  @Patch('subscription-plans/:id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN — Update subscription plan' })
  @ApiParam({ name: 'id', description: 'Plan UUID' })
  updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionPlanDto,
  ) {
    return this.subscriptionsService.updatePlan(id, dto);
  }

  /**
   * Delete subscription plan.
   * ADMIN only.
   */
  @Delete('subscription-plans/:id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ADMIN — Delete subscription plan' })
  @ApiParam({ name: 'id', description: 'Plan UUID' })
  deletePlan(@Param('id') id: string) {
    return this.subscriptionsService.deletePlan(id);
  }

  // ─── Subscription Endpoints ────────────────────────────────────────────────

  /**
   * Get own active subscription.
   */
  @Get('subscriptions/my')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'USER — Get own active subscription' })
  getMySubscription(@CurrentUser() user: JwtPayload) {
    return this.subscriptionsService.getMyActiveSubscription(user.sub);
  }

  /**
   * List all subscriptions.
   * ADMIN only.
   */
  @Get('subscriptions')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN — List all subscriptions' })
  findAllSubscriptions(@Query() query: AdminSubscriptionQueryDto) {
    return this.subscriptionsService.adminFindAllSubscriptions(query);
  }
}
