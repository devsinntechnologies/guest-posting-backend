import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../common/services/redis.service';
import { EmailService } from '../email/email.service';

describe('AuthService verification flow', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };
  let redis: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
  };
  let emailService: { queueEmail: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    } as never;

    redis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    emailService = {
      queueEmail: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { sign: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const values: Record<string, string> = {
                FRONTEND_URL: 'http://localhost:3000',
                JWT_ACCESS_SECRET: 'secret',
                JWT_ACCESS_EXPIRES_IN: '15m',
                JWT_REFRESH_EXPIRES_IN: '7d',
              };
              return values[key];
            }),
          },
        },
        { provide: RedisService, useValue: redis },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('marks a user verified and removes the verification token state', async () => {
    redis.get.mockResolvedValueOnce('user-1');
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', emailVerifiedAt: null });
    prisma.user.update.mockResolvedValue({});

    await service.verifyEmail('token-123');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { emailVerifiedAt: expect.any(Date) },
    });
    expect(redis.del).toHaveBeenCalledWith('email_verify:token-123');
    expect(redis.del).toHaveBeenCalledWith('email_verify:user:user-1');
  });

  it('issues a fresh verification link and invalidates the previous token on resend', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      email: 'jane@example.com',
      name: 'Jane',
      emailVerifiedAt: null,
    });
    redis.get.mockResolvedValueOnce('old-token');

    await service.resendVerification('jane@example.com');

    expect(redis.del).toHaveBeenCalledWith('email_verify:old-token');
    expect(redis.set).toHaveBeenCalledWith(
      expect.stringContaining('email_verify:'),
      'user-1',
      86400,
    );
    expect(emailService.queueEmail).toHaveBeenCalled();
  });
});
