import { UserRole } from '@prisma/client';
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    companyName?: string;
    websiteUrl?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
export declare class AuthTokensDto {
    accessToken: string;
    refreshToken: string;
}
export declare class UpdateRoleDto {
    role: UserRole;
}
