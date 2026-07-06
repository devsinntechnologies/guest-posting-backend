import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Headers,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CheckoutDto } from './dto/payments.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Public, Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Payments')
@Controller()
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('orders/checkout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create checkout session' })
  checkout(@CurrentUser('sub') userId: string, @Body() dto: CheckoutDto) {
    return this.paymentsService.createCheckout(userId, dto);
  }

  @Public()
  @Post('payments/webhook')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(
      req.rawBody || Buffer.from(''),
      signature,
    );
  }

  @Get('orders/my-orders')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user orders' })
  myOrders(@CurrentUser('sub') userId: string, @Query() query: PaginationDto) {
    return this.paymentsService.getMyOrders(userId, query);
  }

  @Get('admin/orders')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders (admin)' })
  allOrders(@Query() query: PaginationDto) {
    return this.paymentsService.getAllOrders(query);
  }
}
