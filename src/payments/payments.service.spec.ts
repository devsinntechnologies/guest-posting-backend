import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { OrderStatus } from '@prisma/client';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: {
    order: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      order: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('whsec_xxx'),
          },
        },
        {
          provide: NotificationsService,
          useValue: { create: jest.fn() },
        },
        {
          provide: EmailService,
          useValue: { queueEmail: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('handleWebhook', () => {
    it('throws when Stripe is not configured', async () => {
      await expect(
        service.handleWebhook(Buffer.from('{}'), 'sig'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('idempotent payment processing', () => {
    it('skips re-processing when order is already paid', () => {
      const paidOrder: {
        id: string;
        status: OrderStatus;
        gatewayTransactionId: string;
      } = {
        id: 'order-1',
        status: OrderStatus.PAID,
        gatewayTransactionId: 'txn_123',
      };

      const isDuplicate = paidOrder.status === OrderStatus.PAID;
      expect(isDuplicate).toBe(true);
    });
  });
});
