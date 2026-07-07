import { Module } from '@nestjs/common';
import { RolesGuard } from './guards/roles.guard';
import { SubscriptionGuard } from './guards/subscription.guard';
import { RedisService } from './services/redis.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RolesGuard, SubscriptionGuard, RedisService],
  exports: [RolesGuard, SubscriptionGuard, RedisService],
})
export class CommonModule {}
