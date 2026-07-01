import { UsersService } from './users.service';
import { UpdateProfileDto, AdminUpdateUserDto, CreateUserDto } from './dto/users.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole } from '@prisma/client';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
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
    findOne(id: string): Promise<{
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
    create(dto: CreateUserDto): Promise<{
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
    remove(id: string, role: UserRole): Promise<{
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
