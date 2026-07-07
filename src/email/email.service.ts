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
  verify_email: (d) =>
    `<h1>Verify Your Email</h1>` +
    `<p>Hi ${d.name},</p>` +
    `<p>Please verify your email address by clicking the link below:</p>` +
    `<p><a href="${d.url}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a></p>` +
    `<p>Alternatively, copy and paste this link in your browser: ${d.url}</p>` +
    `<p>If you did not request this, please ignore this email.</p>`,

  password_reset: (d) =>
    `<h1>Reset Your Password</h1>` +
    `<p>Hi ${d.name},</p>` +
    `<p>You requested to reset your password. Please click the link below to set a new password:</p>` +
    `<p><a href="${d.url}" style="padding: 10px 20px; background-color: #008CBA; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>` +
    `<p>Or copy this link: ${d.url}</p>` +
    `<p>This link is valid for 1 hour. If you did not request a reset, you can safely ignore this email.</p>`,

  welcome: (d) =>
    `<h1>Welcome to Devsinn Insights!</h1>` +
    `<p>Hi ${d.name},</p>` +
    `<p>Thank you for registering at Devsinn Insights — a moderated publishing platform.</p>` +
    `<p>To start publishing articles, please navigate to your dashboard and purchase a subscription plan.</p>`,

  payment_confirmed: (d) =>
    `<h1>Payment Confirmed</h1>` +
    `<p>Hi ${d.name},</p>` +
    `<p>We have successfully received your payment of ${d.amount} ${d.currency}.</p>` +
    `<p>Your subscription plan is now active. You can now create content drafts in your dashboard!</p>`,

  content_status_change: (d) =>
    `<h1>Content Status Update</h1>` +
    `<p>Hi ${d.name},</p>` +
    `<p>Your content draft titled "<strong>${d.title}</strong>" has been updated to status: <strong>${d.status}</strong>.</p>` +
    `${d.note ? `<p><strong>Reviewer feedback:</strong> ${d.note}</p>` : ''}` +
    `<p>Login to your account to review details.</p>`,
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST') || 'localhost',
      port: this.config.get<number>('SMTP_PORT') || 1025,
      auth: {
        user: this.config.get('SMTP_USER') || '',
        pass: this.config.get('SMTP_PASS') || '',
      },
    });
  }

  /**
   * Add email request to queue and log.
   */
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
    } satisfies EmailJobData).catch((err) => {
      this.logger.error(`BullMQ queue error: ${err.message}`);
    });

    return log;
  }

  /**
   * Process email dispatch.
   */
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
      this.logger.error(`Email send failed to ${job.to}: ${error}`);
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
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJobData>) {
    await this.emailService.sendDirect(job.data);
  }
}
