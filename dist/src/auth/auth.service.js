"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../common/services/redis.service");
const email_service_1 = require("../email/email.service");
const RESET_PREFIX = 'pwd_reset:';
const VERIFY_PREFIX = 'email_verify:';
const RESET_TTL = 3600;
const VERIFY_TTL = 86400;
let AuthService = class AuthService {
    prisma;
    jwt;
    config;
    redis;
    emailService;
    constructor(prisma, jwt, config, redis, emailService) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.redis = redis;
        this.emailService = emailService;
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (existing) {
            throw new common_1.ConflictException('An account with this email already exists.');
        }
        const hashed = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email.toLowerCase(),
                password: hashed,
                role: client_1.UserRole.USER,
            },
        });
        const verifyToken = crypto.randomBytes(32).toString('hex');
        await this.redis.set(`${VERIFY_PREFIX}${verifyToken}`, user.id, VERIFY_TTL);
        await this.redis.set(`${VERIFY_PREFIX}user:${user.id}`, verifyToken, VERIFY_TTL);
        const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
        console.log("FRONTEND_URL =", frontendUrl);
        const verifyUrl = `${frontendUrl}/verify-email?token=${verifyToken}`;
        console.log("VERIFY_URL =", verifyUrl);
        await this.emailService.queueEmail(user.email, 'verify_email', 'Verify your email address', {
            name: user.name,
            url: verifyUrl,
        });
        return {
            message: 'Registration successful. Please check your email to verify your account.',
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findFirst({
            where: { email: dto.email.toLowerCase(), deletedAt: null },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Invalid credentials.');
        }
        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) {
            throw new common_1.UnauthorizedException('Invalid credentials.');
        }
        if (!user.emailVerifiedAt) {
            throw new common_1.UnauthorizedException('Please verify your email address before logging in.');
        }
        return this.generateTokens(user.id, user.email, user.role);
    }
    async refresh(refreshToken) {
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
            throw new common_1.UnauthorizedException('Invalid or expired refresh token.');
        }
        await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revokedAt: new Date() },
        });
        return this.generateTokens(stored.user.id, stored.user.email, stored.user.role);
    }
    async logout(refreshToken) {
        const tokenHash = this.hashToken(refreshToken);
        await this.prisma.refreshToken.updateMany({
            where: { tokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return { message: 'Logged out successfully.' };
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findFirst({
            where: { email: email.toLowerCase(), deletedAt: null },
        });
        if (user) {
            const token = crypto.randomBytes(32).toString('hex');
            await this.redis.set(`${RESET_PREFIX}${token}`, user.id, RESET_TTL);
        }
        return {
            message: 'If an account with that email exists, a password reset link has been sent.',
        };
    }
    async resetPassword(token, newPassword) {
        const redisKey = `${RESET_PREFIX}${token}`;
        const userId = await this.redis.get(redisKey);
        if (!userId) {
            throw new common_1.BadRequestException('Invalid or expired password reset token.');
        }
        const hashed = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashed },
        });
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        await this.redis.del(redisKey);
        return { message: 'Password has been reset successfully.' };
    }
    async verifyEmail(token) {
        const redisKey = `${VERIFY_PREFIX}${token}`;
        const userId = await this.redis.get(redisKey);
        if (!userId) {
            throw new common_1.BadRequestException('Invalid or expired email verification token.');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException('User not found.');
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
    async resendVerification(email) {
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
            const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
            const verifyUrl = `${frontendUrl}/verify-email?token=${verifyToken}`;
            await this.emailService.queueEmail(user.email, 'verify_email', 'Verify your email address', {
                name: user.name,
                url: verifyUrl,
            });
        }
        return {
            message: 'If an unverified account with that email exists, a new verification link has been sent.',
        };
    }
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const accessToken = this.jwt.sign(payload, {
            secret: this.config.get('JWT_ACCESS_SECRET'),
            expiresIn: (this.config.get('JWT_ACCESS_EXPIRES_IN') ||
                '15m'),
        });
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const expiresIn = this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d';
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
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    parseExpiry(expiry) {
        const match = expiry.match(/^(\d+)([smhd])$/);
        if (!match)
            return new Date(Date.now() + 7 * 86_400_000);
        const value = parseInt(match[1], 10);
        const multipliers = {
            s: 1_000,
            m: 60_000,
            h: 3_600_000,
            d: 86_400_000,
        };
        return new Date(Date.now() + value * (multipliers[match[2]] ?? 86_400_000));
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        redis_service_1.RedisService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map