import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../common/services/redis.service';
import {
  AuthTokensDto,
  LoginDto,
  MessageResponseDto,
  RegisterDto,
} from './dto/auth.dto';
import { EmailService } from '../email/email.service';

// Redis key prefixes
const RESET_PREFIX = 'pwd_reset:';
const VERIFY_PREFIX = 'email_verify:';

// TTLs in seconds
const RESET_TTL = 3600; // 1 hour
const VERIFY_TTL = 86400; // 24 hours

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,
    private emailService: EmailService,
  ) {}

  /**
   * Register a new user.
   * Sends an email verification link (via EmailService in production).
   */
  async register(dto: RegisterDto): Promise<MessageResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const hashed = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        password: hashed,
        role: UserRole.USER,
      },
    });

    const verifyToken = crypto.randomBytes(32).toString('hex');
    await this.redis.set(`${VERIFY_PREFIX}${verifyToken}`, user.id, VERIFY_TTL);
    await this.redis.set(`${VERIFY_PREFIX}user:${user.id}`, verifyToken, VERIFY_TTL);

    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    console.log("FRONTEND_URL =", frontendUrl);
    const verifyUrl = `${frontendUrl}/verify-email?token=${verifyToken}`;
console.log("VERIFY_URL =", verifyUrl);
    await this.emailService.queueEmail(
      user.email,
      'verify_email',
      'Verify your email address',
      {
        name: user.name,
        url: verifyUrl,
      },
    );

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }

  /**
   * Login with email + password.
   * Requires email to be verified.
   */
  async login(dto: LoginDto): Promise<AuthTokensDto> {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase(), deletedAt: null },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException(
        'Please verify your email address before logging in.',
      );
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  /**
   * Rotate refresh token — revoke old, issue new pair.
   */
  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    const tokenHash = this.hashToken(refreshToken);

    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!stored || stored.user.deletedAt || !stored.user.isActive) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    // Revoke the old token
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.generateTokens(
      stored.user.id,
      stored.user.email,
      stored.user.role,
    );
  }

  /**
   * Revoke the refresh token on logout.
   */
  async logout(refreshToken: string): Promise<MessageResponseDto> {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'Logged out successfully.' };
  }

  /**
   * Initiate password reset — stores token in Redis and queues email.
   * Always returns success to prevent email enumeration.
   */
  async forgotPassword(email: string): Promise<MessageResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
    });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await this.redis.set(`${RESET_PREFIX}${token}`, user.id, RESET_TTL);

      // TODO: Queue reset email via EmailService
      // await this.emailService.sendPasswordResetEmail(user.email, user.name, token);
    }

    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  /**
   * Complete password reset using the Redis-stored token.
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<MessageResponseDto> {
    const redisKey = `${RESET_PREFIX}${token}`;
    const userId = await this.redis.get(redisKey);

    if (!userId) {
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    // Revoke all existing refresh tokens for this user on password change
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.redis.del(redisKey);

    return { message: 'Password has been reset successfully.' };
  }

  /**
   * Verify email address using the token sent during registration.
   */
  async verifyEmail(token: string): Promise<MessageResponseDto> {
    const redisKey = `${VERIFY_PREFIX}${token}`;
    const userId = await this.redis.get(redisKey);

    if (!userId) {
      throw new BadRequestException(
        'Invalid or expired email verification token.',
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    if (user.emailVerifiedAt) {
      await this.redis.del(redisKey);
      return { message: 'Email is already verified.' };
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    });

    await this.redis.del(redisKey);
    await this.redis.del(`${VERIFY_PREFIX}user:${userId}`);

    return { message: 'Email verified successfully. You can now log in.' };
  }

  /**
   * Resend the email verification link.
   */
  async resendVerification(email: string): Promise<MessageResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
    });

    if (user && !user.emailVerifiedAt) {
      const existingToken = await this.redis.get(`${VERIFY_PREFIX}user:${user.id}`);
      if (existingToken) {
        await this.redis.del(`${VERIFY_PREFIX}${existingToken}`);
      }

      const verifyToken = crypto.randomBytes(32).toString('hex');
      await this.redis.set(`${VERIFY_PREFIX}${verifyToken}`, user.id, VERIFY_TTL);
      await this.redis.set(`${VERIFY_PREFIX}user:${user.id}`, verifyToken, VERIFY_TTL);

      const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      const verifyUrl = `${frontendUrl}/verify-email?token=${verifyToken}`;

      await this.emailService.queueEmail(
        user.email,
        'verify_email',
        'Verify your email address',
        {
          name: user.name,
          url: verifyUrl,
        },
      );
    }

    return {
      message:
        'If an unverified account with that email exists, a new verification link has been sent.',
    };
  }

  // ─────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────

  private async generateTokens(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<AuthTokensDto> {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: (this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ||
        '15m') as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    const expiresAt = this.parseExpiry(expiresIn);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseExpiry(expiry: string): Date {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return new Date(Date.now() + 7 * 86_400_000);

    const value = parseInt(match[1], 10);
    const multipliers: Record<string, number> = {
      s: 1_000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };
    return new Date(Date.now() + value * (multipliers[match[2]] ?? 86_400_000));
  }
}
