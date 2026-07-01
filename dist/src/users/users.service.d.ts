import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, AdminUpdateUserDto, CreateUserDto } from './dto/users.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        companyName: string | null;
        websiteUrl: string | null;
        avatarUrl: string | null;
        isActive: boolean;
        emailVerifiedAt: Date | null;
        createdAt: Date;
    }>>;
    findById(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        companyName: string | null;
        websiteUrl: string | null;
        avatarUrl: string | null;
        isActive: boolean;
        emailVerifiedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        companyName: string | null;
        websiteUrl: string | null;
        avatarUrl: string | null;
        isActive: boolean;
        emailVerifiedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        companyName: string | null;
        websiteUrl: string | null;
        avatarUrl: string | null;
    }>;
    adminCreate(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        createdAt: Date;
    }>;
    adminUpdate(id: string, dto: AdminUpdateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        companyName: string | null;
        websiteUrl: string | null;
        avatarUrl: string | null;
        isActive: boolean;
    }>;
    softDelete(id: string, actorRole: UserRole): Promise<{
        id: string;
        email: string;
        name: string;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        companyName: string | null;
        websiteUrl: string | null;
        avatarUrl: string | null;
        isActive: boolean;
        emailVerifiedAt: Date | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
