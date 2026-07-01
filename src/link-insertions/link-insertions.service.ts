import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateLinkInsertionDto,
  UpdateLinkInsertionStatusDto,
} from './dto/link-insertions.dto';
import { PaginationDto, paginate, getSkip } from '../common/dto/pagination.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class LinkInsertionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto, userId?: string, role?: UserRole) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = getSkip(page, limit);

    const where =
      role === UserRole.CONTRIBUTOR && userId ? { requestedById: userId } : {};

    const [items, total] = await Promise.all([
      this.prisma.linkInsertion.findMany({
        where,
        skip,
        take: limit,
        include: {
          requestedBy: { select: { id: true, name: true, email: true } },
          targetArticle: { select: { id: true, title: true, slug: true } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.linkInsertion.count({ where }),
    ]);

    return paginate(items, total, page, limit);
  }

  async create(dto: CreateLinkInsertionDto, userId: string) {
    return this.prisma.linkInsertion.create({
      data: {
        requestedById: userId,
        targetArticleId: dto.targetArticleId,
        anchorText: dto.anchorText,
        destinationUrl: dto.destinationUrl,
        price: dto.price,
      },
      include: {
        targetArticle: { select: { id: true, title: true, slug: true } },
      },
    });
  }

  async updateStatus(id: string, dto: UpdateLinkInsertionStatusDto) {
    const insertion = await this.prisma.linkInsertion.findUnique({
      where: { id },
    });
    if (!insertion) throw new NotFoundException('Link insertion not found');

    return this.prisma.linkInsertion.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.paymentId ? { paymentId: dto.paymentId } : {}),
      },
    });
  }
}
