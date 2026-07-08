import { UserRole } from '@prisma/client';
export declare class UpdateProfileDto {
    name?: string;
    bio?: string;
    website?: string;
    linkedin?: string;
    twitter?: string;
    avatarUrl?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class AdminUserQueryDto {
    page: number;
    limit: number;
    search?: string;
    role?: UserRole;
    sortOrder?: 'asc' | 'desc';
    isActive?: boolean;
}
export declare class AdminUpdateUserDto {
    isActive?: boolean;
    role?: UserRole;
}
