import { PrismaService } from '../prisma/prisma.service';
import { CategoryQueryDto, CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
import { Category } from '@prisma/client';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateCategoryDto): Promise<Category>;
    findAll(query: CategoryQueryDto, onlyActive?: boolean): Promise<PaginatedResult<Category>>;
    findBySlug(slug: string): Promise<Category>;
    findById(id: string): Promise<Category>;
    update(id: string, dto: UpdateCategoryDto): Promise<Category>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
