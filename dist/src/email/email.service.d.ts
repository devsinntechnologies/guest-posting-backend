import { ConfigService } from '@nestjs/config';
import { WorkerHost } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
export interface EmailJobData {
    to: string;
    templateName: string;
    subject: string;
    html: string;
    emailLogId?: string;
}
export declare class EmailService {
    private config;
    private prisma;
    private emailQueue;
    private readonly logger;
    private transporter;
    constructor(config: ConfigService, prisma: PrismaService, emailQueue: Queue);
    queueEmail(to: string, templateName: string, subject: string, data: Record<string, string>): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.EmailLogStatus;
        subject: string;
        toEmail: string;
        templateName: string;
        errorMessage: string | null;
        sentAt: Date | null;
    }>;
    sendDirect(job: EmailJobData): Promise<void>;
}
export declare class EmailProcessor extends WorkerHost {
    private emailService;
    constructor(emailService: EmailService);
    process(job: Job<EmailJobData>): Promise<void>;
}
