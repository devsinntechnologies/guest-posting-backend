import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Headers,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import {
  AdminPaymentQueryDto,
  InitiatePaymentDto,
  PaymentQueryDto,
} from './dto/payment.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { Public, Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Initiate a payment to purchase a subscription.
   * USER only.
   */
  @Post('initiate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'USER — Initiate payment for a subscription plan' })
  initiatePayment(
    @CurrentUser() user: JwtPayload,
    @Body() dto: InitiatePaymentDto,
  ) {
    return this.paymentsService.initiatePayment(user.sub, dto);
  }

  /**
   * Stripe webhook verification endpoint.
   * Must use raw request body.
   */
  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Public — Stripe webhook endpoint' })
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(
      req.rawBody || Buffer.from(''),
      signature,
    );
  }

  /**
   * Helper endpoint: Simulate checkout confirmation for testing/mocks.
   * Works for both stripe checkout sessions and local mock checkout sessions.
   */
  @Post('mock-complete')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Public — Simulate checkout webhook completion for local testing' })
  mockComplete(
    @Body('providerTransactionId') providerTransactionId: string,
    @Body('status') status: 'COMPLETED' | 'FAILED',
  ) {
    return this.paymentsService.processPaymentCompletion(
      providerTransactionId,
      status || 'COMPLETED',
      { mockCompletedAt: new Date() },
    );
  }

  /**
   * Get own payment history.
   * USER only.
   */
  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: "USER — Get own payment history" })
  myPayments(@CurrentUser() user: JwtPayload, @Query() query: PaymentQueryDto) {
    return this.paymentsService.getMyPayments(user.sub, query);
  }

  /**
   * Get all payments.
   * ADMIN only.
   */
  @Get()
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "ADMIN — Get all payments" })
  adminGetAllPayments(@Query() query: AdminPaymentQueryDto) {
    return this.paymentsService.adminGetAllPayments(query);
  }
}
