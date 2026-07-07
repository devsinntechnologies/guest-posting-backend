import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { NewsletterService } from './newsletter.service';
import {
  NewsletterQueryDto,
  SubscribeNewsletterDto,
  UnsubscribeNewsletterDto,
} from './dto/newsletter.dto';
import { Public, Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  /**
   * Subscribe to newsletter list.
   * Public.
   */
  @Post('subscribe')
  @Public()
  @ApiOperation({ summary: 'Public — Subscribe to the newsletter mailing list' })
  subscribe(@Body() dto: SubscribeNewsletterDto) {
    return this.newsletterService.subscribe(dto);
  }

  /**
   * Unsubscribe from newsletter list.
   * Public.
   */
  @Post('unsubscribe')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Public — Unsubscribe from the newsletter using token' })
  unsubscribe(@Body() dto: UnsubscribeNewsletterDto) {
    return this.newsletterService.unsubscribe(dto.token);
  }

  /**
   * List subscribers.
   * ADMIN only.
   */
  @Get()
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN — List newsletter subscribers' })
  findAll(@Query() query: NewsletterQueryDto) {
    return this.newsletterService.findAll(query);
  }
}
