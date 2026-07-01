import { Module, forwardRef } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [forwardRef(() => NotificationsModule)],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
