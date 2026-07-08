import { EmailService } from './email.service';
import { EmailLogStatus } from '@prisma/client';

describe('EmailService', () => {
  let service: EmailService;
  let prisma: { emailLog: { create: jest.Mock; update: jest.Mock } };
  let emailQueue: { add: jest.Mock };
  let config: { get: jest.Mock };

  beforeEach(() => {
    prisma = {
      emailLog: {
        create: jest.fn().mockResolvedValue({ id: 'email-log-1' }),
        update: jest.fn().mockResolvedValue({}),
      },
    };

    emailQueue = {
      add: jest.fn().mockRejectedValue(new Error('queue unavailable')),
    };

    config = {
      get: jest.fn((key: string) => {
        const values: Record<string, string | number> = {
          SMTP_HOST: 'smtp.mailtrap.io',
          SMTP_PORT: 2525,
          SMTP_USER: 'user',
          SMTP_PASS: 'pass',
          SMTP_FROM: 'noreply@devsinn.com',
        };
        return values[key];
      }),
    };

    service = new EmailService(config as never, prisma as never, emailQueue as never);
  });

  it('falls back to direct sending when the mail queue is unavailable', async () => {
    const sendDirectSpy = jest
      .spyOn(service as never, 'sendDirect')
      .mockResolvedValue(undefined as never);

    await service.queueEmail('user@example.com', 'verify_email', 'Verify your email', {
      name: 'Jane',
      url: 'https://example.com/verify?token=abc',
    });

    expect(prisma.emailLog.create).toHaveBeenCalledWith({
      data: {
        toEmail: 'user@example.com',
        templateName: 'verify_email',
        subject: 'Verify your email',
        status: EmailLogStatus.QUEUED,
      },
    });
    expect(sendDirectSpy).toHaveBeenCalled();
  });
});
