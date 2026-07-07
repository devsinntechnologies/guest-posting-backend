import { PrismaService } from '../prisma/prisma.service';
import { AdminUpdateUserDto, AdminUserQueryDto, ChangePasswordDto, UpdateProfileDto } from './dto/user.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
import { User } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: AdminUserQueryDto): Promise<PaginatedResult<Partial<User>>>;
    findById(id: string): Promise<Partial<User>>;
    getMyProfile(userId: string): Promise<Partial<User>>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<Partial<User>>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    adminUpdateUser(id: string, dto: AdminUpdateUserDto): Promise<Partial<User>>;
    softDelete(adminId: string, targetUserId: string): Promise<{
        message: string;
    }>;
    hasActiveSubscription(userId: string): Promise<boolean>;
}
