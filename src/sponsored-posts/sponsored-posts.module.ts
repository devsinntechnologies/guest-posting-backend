import { Module } from '@nestjs/common';
import { SponsoredPostsService } from './sponsored-posts.service';
import { SponsoredPostsController } from './sponsored-posts.controller';

@Module({
  controllers: [SponsoredPostsController],
  providers: [SponsoredPostsService],
  exports: [SponsoredPostsService],
})
export class SponsoredPostsModule {}
