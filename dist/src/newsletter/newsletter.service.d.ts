import { PrismaService } from '../prisma/prisma.service';
import { NewsletterQueryDto, SubscribeNewsletterDto } from './dto/newsletter.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
import { NewsletterSubscriber } from '@prisma/client';
export declare class NewsletterService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    subscribe(dto: SubscribeNewsletterDto): Promise<{
        message: string;
    }>;
    unsubscribe(token: string): Promise<{
        message: string;
    }>;
    findAll(query: NewsletterQueryDto): Promise<PaginatedResult<NewsletterSubscriber>>;
}
