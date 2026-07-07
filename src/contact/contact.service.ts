import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContactMessageQueryDto, CreateContactMessageDto } from './dto/contact.dto';
import {
  createPaginatedResult,
  PaginatedResult,
} from '../common/dto/paginated-result.dto';
import { getPrismaSkipTake } from '../common/utils/pagination.util';
import { ContactMessage } from '@prisma/client';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new contact message (Public).
   */
  async create(dto: CreateContactMessageDto): Promise<ContactMessage> {
    return this.prisma.contactMessage.create({
      data: {
        name: dto.name,
        email: dto.email,
        subject: dto.subject,
        message: dto.message,
      },
    });
  }

  /**
   * ADMIN: List all contact messages paginated.
   */
  async findAll(
    query: ContactMessageQueryDto,
  ): Promise<PaginatedResult<ContactMessage>> {
    const { page, limit } = query;
    const { skip, take } = getPrismaSkipTake(page, limit);

    const [items, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contactMessage.count(),
    ]);

    return createPaginatedResult(items, total, page, limit);
  }

  /**
   * ADMIN: Mark contact message as read.
   */
  async markAsRead(id: string): Promise<ContactMessage> {
    const msg = await this.prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!msg) {
      throw new NotFoundException('Contact message not found.');
    }

    return this.prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
  }
}
