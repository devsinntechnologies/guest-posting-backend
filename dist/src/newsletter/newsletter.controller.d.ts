import { NewsletterService } from './newsletter.service';
import { NewsletterQueryDto, SubscribeNewsletterDto, UnsubscribeNewsletterDto } from './dto/newsletter.dto';
export declare class NewsletterController {
    private readonly newsletterService;
    constructor(newsletterService: NewsletterService);
    subscribe(dto: SubscribeNewsletterDto): Promise<{
        message: string;
    }>;
    unsubscribe(dto: UnsubscribeNewsletterDto): Promise<{
        message: string;
    }>;
    findAll(query: NewsletterQueryDto): Promise<import("../common/dto/paginated-result.dto").PaginatedResult<{
        id: string;
        email: string;
        name: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        unsubscribeToken: string;
        subscribedAt: Date;
        unsubscribedAt: Date | null;
    }>>;
}
