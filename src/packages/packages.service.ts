import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePackageDto, UpdatePackageDto } from './dto/packages.dto';
import { PaginationDto, paginate, getSkip } from '../common/dto/pagination.dto';

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto, activeOnly = true) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = getSkip(page, limit);

    const where = activeOnly ? { isActive: true } : {};

    const [items, total] = await Promise.all([
      this.prisma.package.findMany({
        where,
        skip,
        take: limit,
        orderBy: { price: 'asc' },
      }),
      this.prisma.package.count({ where }),
    ]);

    return paginate(items, total, page, limit);
  }

  async findById(id: string) {
    const pkg = await this.prisma.package.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async create(dto: CreatePackageDto) {
    return this.prisma.package.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        currency: dto.currency || 'USD',
        features: dto.features || [],
        durationDays: dto.durationDays || 30,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdatePackageDto) {
    await this.findById(id);
    return this.prisma.package.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.package.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
