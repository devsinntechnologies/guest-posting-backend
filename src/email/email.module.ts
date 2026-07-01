import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailService, EmailProcessor } from './email.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'email' })],
  providers: [EmailService, EmailProcessor],
  exports: [EmailService],
})
export class EmailModule {}
