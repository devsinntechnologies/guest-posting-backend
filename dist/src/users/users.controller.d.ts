import { UsersService } from './users.service';
import { AdminUpdateUserDto, AdminUserQueryDto, ChangePasswordDto, UpdateProfileDto } from './dto/user.dto';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(query: AdminUserQueryDto): Promise<import("../common/dto/paginated-result.dto").PaginatedResult<Partial<{
        id: string;
        email: string;
        name: string;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        avatarUrl: string | null;
        bio: string | null;
        website: string | null;
        linkedin: string | null;
        twitter: string | null;
        emailVerifiedAt: Date | null;
        isActive: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>>>;
    getMe(user: JwtPayload): Promise<Partial<{
        id: string;
        email: string;
        name: string;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        avatarUrl: string | null;
        bio: string | null;
        website: string | null;
        linkedin: string | null;
        twitter: string | null;
        emailVerifiedAt: Date | null;
        isActive: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>>;
    updateProfile(user: JwtPayload, dto: UpdateProfileDto): Promise<Partial<{
        id: string;
        email: string;
        name: string;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        avatarUrl: string | null;
        bio: string | null;
        website: string | null;
        linkedin: string | null;
        twitter: string | null;
        emailVerifiedAt: Date | null;
        isActive: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>>;
    changePassword(user: JwtPayload, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    findById(id: string): Promise<Partial<{
        id: string;
        email: string;
        name: string;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        avatarUrl: string | null;
        bio: string | null;
        website: string | null;
        linkedin: string | null;
        twitter: string | null;
        emailVerifiedAt: Date | null;
        isActive: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>>;
    adminUpdateUser(id: string, dto: AdminUpdateUserDto): Promise<Partial<{
        id: string;
        email: string;
        name: string;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        avatarUrl: string | null;
        bio: string | null;
        website: string | null;
        linkedin: string | null;
        twitter: string | null;
        emailVerifiedAt: Date | null;
        isActive: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>>;
    softDelete(admin: JwtPayload, id: string): Promise<{
        message: string;
    }>;
}
