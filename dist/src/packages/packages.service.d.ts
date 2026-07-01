import { PrismaService } from '../prisma/prisma.service';
import { CreatePackageDto, UpdatePackageDto } from './dto/packages.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class PackagesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: PaginationDto, activeOnly?: boolean): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        features: import("@prisma/client/runtime/library").JsonValue;
        durationDays: number;
    }>>;
    findById(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        features: import("@prisma/client/runtime/library").JsonValue;
        durationDays: number;
    }>;
    create(dto: CreatePackageDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        features: import("@prisma/client/runtime/library").JsonValue;
        durationDays: number;
    }>;
    update(id: string, dto: UpdatePackageDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        features: import("@prisma/client/runtime/library").JsonValue;
        durationDays: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        features: import("@prisma/client/runtime/library").JsonValue;
        durationDays: number;
    }>;
}
