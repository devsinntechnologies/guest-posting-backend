import { UserRole } from '@prisma/client';
export declare class UpdateProfileDto {
    name?: string;
    companyName?: string;
    websiteUrl?: string;
    avatarUrl?: string;
}
export declare class AdminUpdateUserDto extends UpdateProfileDto {
    role?: UserRole;
    isActive?: boolean;
}
export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    companyName?: string;
}
