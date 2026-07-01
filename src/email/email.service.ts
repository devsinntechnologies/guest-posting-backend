import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { EmailLogStatus } from '@prisma/client';

export interface EmailJobData {
  to: string;
  templateName: string;
  subject: string;
  html: string;
  emailLogId?: string;
}

const TEMPLATES: Record<string, (data: Record<string, string>) => string> = {
  submission_received: (d) =>
    `<h1>Submission Received</h1><p>Hi ${d.name}, your article "${d.title}" has been submitted for review.</p>`,
  article_published: (d) =>
    `<h1>Your Article is Live!</h1><p>Hi ${d.name}, your article "${d.title}" is now published at ${d.url}.</p>`,
  article_rejected: (d) =>
    `<h1>Article Rejected</h1><p>Hi ${d.name}, your article "${d.title}" was rejected. Reason: ${d.reason}</p>`,
  payment_confirmed: (d) =>
    `<h1>Payment Confirmed</h1><p>Hi ${d.name}, your payment of ${d.amount} ${d.currency} was confirmed.</p>`,
  password_reset: (d) =>
    `<h1>Password Reset</h1><p>Click <a href="${d.url}">here</a> to reset your password.</p>`,
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT') || 587,
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  async queueEmail(
    to: string,
    templateName: string,
    subject: string,
    data: Record<string, string>,
  ) {
    const html = TEMPLATES[templateName]?.(data) || `<p>${subject}</p>`;

    const log = await this.prisma.emailLog.create({
      data: {
        toEmail: to,
        templateName,
        subject,
        status: EmailLogStatus.QUEUED,
      },
    });

    await this.emailQueue.add('send', {
      to,
      templateName,
      subject,
      html,
      emailLogId: log.id,
    } satisfies EmailJobData);

    return log;
  }

  async sendDirect(job: EmailJobData) {
    try {
      await this.transporter.sendMail({
        from: this.config.get('SMTP_FROM') || 'noreply@devsinn.com',
        to: job.to,
        subject: job.subject,
        html: job.html,
      });

      if (job.emailLogId) {
        await this.prisma.emailLog.update({
          where: { id: job.emailLogId },
          data: { status: EmailLogStatus.SENT, sentAt: new Date() },
        });
      }
    } catch (error) {
      this.logger.error(`Email send failed: ${error}`);
      if (job.emailLogId) {
        await this.prisma.emailLog.update({
          where: { id: job.emailLogId },
          data: {
            status: EmailLogStatus.FAILED,
            errorMessage: String(error),
          },
        });
      }
      throw error;
    }
  }
}

@Processor('email')
export class EmailProcessor extends WorkerHost {
  constructor(private emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJobData>) {
    await this.emailService.sendDirect(job.data);
  }
}
