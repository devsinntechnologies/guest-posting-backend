import { Module } from '@nestjs/common';
import { LinkInsertionsService } from './link-insertions.service';
import { LinkInsertionsController } from './link-insertions.controller';

@Module({
  controllers: [LinkInsertionsController],
  providers: [LinkInsertionsService],
  exports: [LinkInsertionsService],
})
export class LinkInsertionsModule {}
