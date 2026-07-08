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
    `<!DOCTYPE html>` +
    `<html lang="en">` +
    `<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">` +
    `<div style="max-width:640px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 35px rgba(15,23,42,0.08);">` +
    `<div style="background:linear-gradient(135deg,#0f172a,#2563eb);padding:28px 32px;text-align:center;">` +
    `<h1 style="margin:0;color:#ffffff;font-size:28px;">Verify your email</h1>` +
    `</div>` +
    `<div style="padding:32px;">` +
    `<p style="margin:0 0 12px;font-size:16px;">Hi ${d.name},</p>` +
    `<p style="margin:0 0 16px;line-height:1.6;font-size:15px;">Welcome to Devsinn Insights. Please verify your email address to activate your account and start using the platform.</p>` +
    `<p style="margin:0 0 20px;text-align:center;">` +
    `<a href="${d.url}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:700;">Verify Email</a>` +
    `</p>` +
    `<p style="margin:0 0 8px;font-size:13px;color:#475569;">If the button does not work, open this link in your browser:</p>` +
    `<p style="margin:0 0 16px;font-size:13px;color:#2563eb;word-break:break-all;">${d.url}</p>` +
    `<p style="margin:0;font-size:13px;color:#64748b;">This verification link expires in 24 hours. If you did not create an account, you can safely ignore this email.</p>` +
    `</div>` +
    `</div>` +
    `</body>` +
    `</html>`,

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

    try {
      await this.emailQueue.add('send', {
        to,
        templateName,
        subject,
        html,
        emailLogId: log.id,
      } satisfies EmailJobData);
    } catch (error) {
      this.logger.error(`BullMQ queue error: ${error instanceof Error ? error.message : String(error)}`);
      await this.sendDirect({
        to,
        templateName,
        subject,
        html,
        emailLogId: log.id,
      });
    }

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
