import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto, UpdateTagDto } from './dto/tags.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole } from '@prisma/client';
export declare class TagsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        _count: {
            articleTags: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
    }>>;
    findBySlug(slug: string): Promise<{
        _count: {
            articleTags: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
    }>;
    create(dto: CreateTagDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
    }>;
    update(id: string, dto: UpdateTagDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
    }>;
    remove(id: string, role: UserRole): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
    }>;
}
