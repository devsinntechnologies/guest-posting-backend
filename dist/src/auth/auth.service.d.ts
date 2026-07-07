import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../common/services/redis.service';
import { AuthTokensDto, LoginDto, MessageResponseDto, RegisterDto } from './dto/auth.dto';
import { EmailService } from '../email/email.service';
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    private redis;
    private emailService;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService, redis: RedisService, emailService: EmailService);
    register(dto: RegisterDto): Promise<MessageResponseDto>;
    login(dto: LoginDto): Promise<AuthTokensDto>;
    refresh(refreshToken: string): Promise<AuthTokensDto>;
    logout(refreshToken: string): Promise<MessageResponseDto>;
    forgotPassword(email: string): Promise<MessageResponseDto>;
    resetPassword(token: string, newPassword: string): Promise<MessageResponseDto>;
    verifyEmail(token: string): Promise<MessageResponseDto>;
    resendVerification(email: string): Promise<MessageResponseDto>;
    private generateTokens;
    private hashToken;
    private parseExpiry;
}
