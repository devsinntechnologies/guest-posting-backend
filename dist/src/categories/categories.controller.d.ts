import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole } from '@prisma/client';
export declare class CategoriesController {
    private categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(query: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        parentCategory: {
            id: string;
            name: string;
            slug: string;
        } | null;
        childCategories: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            description: string | null;
            metaTitle: string | null;
            metaDescription: string | null;
            parentCategoryId: string | null;
        }[];
        _count: {
            articles: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        parentCategoryId: string | null;
    }>>;
    findBySlug(slug: string): Promise<{
        parentCategory: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            description: string | null;
            metaTitle: string | null;
            metaDescription: string | null;
            parentCategoryId: string | null;
        } | null;
        childCategories: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            description: string | null;
            metaTitle: string | null;
            metaDescription: string | null;
            parentCategoryId: string | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        parentCategoryId: string | null;
    }>;
    getArticles(slug: string, query: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        author: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        metaTitle: string | null;
        metaDescription: string | null;
        title: string;
        content: string;
        excerpt: string | null;
        featuredImageUrl: string | null;
        authorId: string;
        categoryId: string | null;
        status: import("@prisma/client").$Enums.ArticleStatus;
        targetUrl: string | null;
        anchorText: string | null;
        metaKeywords: string | null;
        readingTimeMinutes: number;
        viewCount: number;
        rejectionReason: string | null;
        publishedAt: Date | null;
    }>>;
    create(dto: CreateCategoryDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        parentCategoryId: string | null;
    }>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        parentCategoryId: string | null;
    }>;
    remove(id: string, role: UserRole): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        parentCategoryId: string | null;
    }>;
}
