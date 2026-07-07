import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NewsletterQueryDto, SubscribeNewsletterDto } from './dto/newsletter.dto';
import {
  createPaginatedResult,
  PaginatedResult,
} from '../common/dto/paginated-result.dto';
import { getPrismaSkipTake } from '../common/utils/pagination.util';
import { NewsletterSubscriber } from '@prisma/client';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Subscribe an email to the newsletter.
   * Toggle subscription state if already exists.
   */
  async subscribe(dto: SubscribeNewsletterDto) {
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      if (existing.isActive) {
        return { message: 'You are already subscribed to our newsletter.' };
      }

      // Re-activate subscription
      await this.prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: {
          isActive: true,
          name: dto.name || existing.name,
          unsubscribedAt: null,
        },
      });

      return { message: 'Subscription successfully re-activated!' };
    }

    // Create new subscriber
    await this.prisma.newsletterSubscriber.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name,
        isActive: true,
      },
    });

    return { message: 'Thank you for subscribing to our newsletter!' };
  }

  /**
   * Unsubscribe using the unique unsubscribe token.
   */
  async unsubscribe(token: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!subscriber) {
      throw new NotFoundException('Invalid unsubscribe token.');
    }

    if (!subscriber.isActive) {
      return { message: 'You have already unsubscribed.' };
    }

    await this.prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    return { message: 'You have been successfully unsubscribed from our newsletter.' };
  }

  /**
   * ADMIN: List newsletter subscribers paginated.
   */
  async findAll(
    query: NewsletterQueryDto,
  ): Promise<PaginatedResult<NewsletterSubscriber>> {
    const { page, limit } = query;
    const { skip, take } = getPrismaSkipTake(page, limit);

    const [items, total] = await Promise.all([
      this.prisma.newsletterSubscriber.findMany({
        skip,
        take,
        orderBy: { subscribedAt: 'desc' },
      }),
      this.prisma.newsletterSubscriber.count(),
    ]);

    return createPaginatedResult(items, total, page, limit);
  }
}
