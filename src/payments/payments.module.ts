import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeProvider } from './providers/stripe.provider';
import { PAYMENT_PROVIDER } from './interfaces/payment-provider.interface';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [PrismaModule, CommonModule, SubscriptionsModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    StripeProvider,
    {
      provide: PAYMENT_PROVIDER,
      useClass: StripeProvider,
    },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
