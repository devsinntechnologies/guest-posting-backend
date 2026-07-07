import { ContactService } from './contact.service';
import { ContactMessageQueryDto, CreateContactMessageDto } from './dto/contact.dto';
export declare class ContactController {
    private readonly contactService;
    constructor(contactService: ContactService);
    create(dto: CreateContactMessageDto): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        subject: string;
        isRead: boolean;
    }>;
    findAll(query: ContactMessageQueryDto): Promise<import("../common/dto/paginated-result.dto").PaginatedResult<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        subject: string;
        isRead: boolean;
    }>>;
    markAsRead(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        subject: string;
        isRead: boolean;
    }>;
}
