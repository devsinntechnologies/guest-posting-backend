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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProcessor = exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("@nestjs/bullmq");
const bullmq_3 = require("bullmq");
const nodemailer = __importStar(require("nodemailer"));
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const TEMPLATES = {
    verify_email: (d) => `<h1>Verify Your Email</h1>` +
        `<p>Hi ${d.name},</p>` +
        `<p>Please verify your email address by clicking the link below:</p>` +
        `<p><a href="${d.url}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a></p>` +
        `<p>Alternatively, copy and paste this link in your browser: ${d.url}</p>` +
        `<p>If you did not request this, please ignore this email.</p>`,
    password_reset: (d) => `<h1>Reset Your Password</h1>` +
        `<p>Hi ${d.name},</p>` +
        `<p>You requested to reset your password. Please click the link below to set a new password:</p>` +
        `<p><a href="${d.url}" style="padding: 10px 20px; background-color: #008CBA; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>` +
        `<p>Or copy this link: ${d.url}</p>` +
        `<p>This link is valid for 1 hour. If you did not request a reset, you can safely ignore this email.</p>`,
    welcome: (d) => `<h1>Welcome to Devsinn Insights!</h1>` +
        `<p>Hi ${d.name},</p>` +
        `<p>Thank you for registering at Devsinn Insights — a moderated publishing platform.</p>` +
        `<p>To start publishing articles, please navigate to your dashboard and purchase a subscription plan.</p>`,
    payment_confirmed: (d) => `<h1>Payment Confirmed</h1>` +
        `<p>Hi ${d.name},</p>` +
        `<p>We have successfully received your payment of ${d.amount} ${d.currency}.</p>` +
        `<p>Your subscription plan is now active. You can now create content drafts in your dashboard!</p>`,
    content_status_change: (d) => `<h1>Content Status Update</h1>` +
        `<p>Hi ${d.name},</p>` +
        `<p>Your content draft titled "<strong>${d.title}</strong>" has been updated to status: <strong>${d.status}</strong>.</p>` +
        `${d.note ? `<p><strong>Reviewer feedback:</strong> ${d.note}</p>` : ''}` +
        `<p>Login to your account to review details.</p>`,
};
let EmailService = EmailService_1 = class EmailService {
    config;
    prisma;
    emailQueue;
    logger = new common_1.Logger(EmailService_1.name);
    transporter;
    constructor(config, prisma, emailQueue) {
        this.config = config;
        this.prisma = prisma;
        this.emailQueue = emailQueue;
        this.transporter = nodemailer.createTransport({
            host: this.config.get('SMTP_HOST') || 'localhost',
            port: this.config.get('SMTP_PORT') || 1025,
            auth: {
                user: this.config.get('SMTP_USER') || '',
                pass: this.config.get('SMTP_PASS') || '',
            },
        });
    }
    async queueEmail(to, templateName, subject, data) {
        const html = TEMPLATES[templateName]?.(data) || `<p>${subject}</p>`;
        const log = await this.prisma.emailLog.create({
            data: {
                toEmail: to,
                templateName,
                subject,
                status: client_1.EmailLogStatus.QUEUED,
            },
        });
        await this.emailQueue.add('send', {
            to,
            templateName,
            subject,
            html,
            emailLogId: log.id,
        }).catch((err) => {
            this.logger.error(`BullMQ queue error: ${err.message}`);
        });
        return log;
    }
    async sendDirect(job) {
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
                    data: { status: client_1.EmailLogStatus.SENT, sentAt: new Date() },
                });
            }
        }
        catch (error) {
            this.logger.error(`Email send failed to ${job.to}: ${error}`);
            if (job.emailLogId) {
                await this.prisma.emailLog.update({
                    where: { id: job.emailLogId },
                    data: {
                        status: client_1.EmailLogStatus.FAILED,
                        errorMessage: String(error),
                    },
                });
            }
            throw error;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bullmq_2.InjectQueue)('email')),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService,
        bullmq_3.Queue])
], EmailService);
let EmailProcessor = class EmailProcessor extends bullmq_1.WorkerHost {
    emailService;
    constructor(emailService) {
        super();
        this.emailService = emailService;
    }
    async process(job) {
        await this.emailService.sendDirect(job.data);
    }
};
exports.EmailProcessor = EmailProcessor;
exports.EmailProcessor = EmailProcessor = __decorate([
    (0, bullmq_1.Processor)('email'),
    __metadata("design:paramtypes", [EmailService])
], EmailProcessor);
//# sourceMappingURL=email.service.js.map