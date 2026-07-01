import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSponsoredPostDto,
  UpdateSponsoredPostDto,
} from './dto/sponsored-posts.dto';
import { PaginationDto, paginate, getSkip } from '../common/dto/pagination.dto';

@Injectable()
export class SponsoredPostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = getSkip(page, limit);

    const [items, total] = await Promise.all([
      this.prisma.sponsoredPost.findMany({
        skip,
        take: limit,
        include: {
          article: { select: { id: true, title: true, slug: true } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { startDate: 'desc' },
      }),
      this.prisma.sponsoredPost.count(),
    ]);

    return paginate(items, total, page, limit);
  }

  async findActive(placement?: string) {
    const now = new Date();
    return this.prisma.sponsoredPost.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        ...(placement ? { placement: placement as never } : {}),
      },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            featuredImageUrl: true,
            excerpt: true,
          },
        },
      },
    });
  }

  async create(dto: CreateSponsoredPostDto, userId: string) {
    return this.prisma.sponsoredPost.create({
      data: {
        articleId: dto.articleId,
        userId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        placement: dto.placement,
        isActive: dto.isActive ?? true,
      },
      include: { article: true },
    });
  }

  async update(id: string, dto: UpdateSponsoredPostDto) {
    const post = await this.prisma.sponsoredPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Sponsored post not found');

    return this.prisma.sponsoredPost.update({
      where: { id },
      data: {
        ...(dto.startDate ? { startDate: new Date(dto.startDate) } : {}),
        ...(dto.endDate ? { endDate: new Date(dto.endDate) } : {}),
        ...(dto.placement ? { placement: dto.placement } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async remove(id: string) {
    const post = await this.prisma.sponsoredPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Sponsored post not found');
    return this.prisma.sponsoredPost.delete({ where: { id } });
  }
}
