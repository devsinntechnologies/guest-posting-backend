import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto, UpdateTagDto } from './dto/tags.dto';
import { generateSlug, ensureUniqueSlug } from '../common/utils/slug.util';
import { PaginationDto, paginate, getSkip } from '../common/dto/pagination.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = getSkip(page, limit);

    const [items, total] = await Promise.all([
      this.prisma.tag.findMany({
        skip,
        take: limit,
        include: { _count: { select: { articleTags: true } } },
        orderBy: { name: 'asc' },
      }),
      this.prisma.tag.count(),
    ]);

    return paginate(items, total, page, limit);
  }

  async findBySlug(slug: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { slug },
      include: { _count: { select: { articleTags: true } } },
    });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async create(dto: CreateTagDto) {
    const baseSlug = generateSlug(dto.name);
    const slug = await ensureUniqueSlug(baseSlug, async (s) => {
      return !!(await this.prisma.tag.findUnique({ where: { slug: s } }));
    });

    return this.prisma.tag.create({ data: { name: dto.name, slug } });
  }

  async update(id: string, dto: UpdateTagDto) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');

    const baseSlug = generateSlug(dto.name);
    const slug = await ensureUniqueSlug(
      baseSlug,
      async (s) => !!(await this.prisma.tag.findUnique({ where: { slug: s } })),
      tag.slug,
    );

    return this.prisma.tag.update({
      where: { id },
      data: { name: dto.name, slug },
    });
  }

  async remove(id: string, role: UserRole) {
    if (role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can delete tags');
    }
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    return this.prisma.tag.delete({ where: { id } });
  }
}
