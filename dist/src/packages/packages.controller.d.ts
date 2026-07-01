import { PackagesService } from './packages.service';
import { CreatePackageDto, UpdatePackageDto } from './dto/packages.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class PackagesController {
    private packagesService;
    constructor(packagesService: PackagesService);
    findAll(query: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
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
    findAllAdmin(query: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
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
