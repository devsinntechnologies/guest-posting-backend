import { PrismaService } from '../prisma/prisma.service';
import { ContactMessageQueryDto, CreateContactMessageDto } from './dto/contact.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
import { ContactMessage } from '@prisma/client';
export declare class ContactService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateContactMessageDto): Promise<ContactMessage>;
    findAll(query: ContactMessageQueryDto): Promise<PaginatedResult<ContactMessage>>;
    markAsRead(id: string): Promise<ContactMessage>;
}
