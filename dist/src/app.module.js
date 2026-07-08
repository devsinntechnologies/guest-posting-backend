"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const bullmq_1 = require("@nestjs/bullmq");
const nestjs_pino_1 = require("nestjs-pino");
const prisma_module_1 = require("./prisma/prisma.module");
const common_module_1 = require("./common/common.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const content_module_1 = require("./content/content.module");
const categories_module_1 = require("./categories/categories.module");
const comments_module_1 = require("./comments/comments.module");
const likes_module_1 = require("./likes/likes.module");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
const payments_module_1 = require("./payments/payments.module");
const review_module_1 = require("./review/review.module");
const notifications_module_1 = require("./notifications/notifications.module");
const email_module_1 = require("./email/email.module");
const seo_module_1 = require("./seo/seo.module");
const settings_module_1 = require("./settings/settings.module");
const contact_module_1 = require("./contact/contact.module");
const newsletter_module_1 = require("./newsletter/newsletter.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const media_module_1 = require("./media/media.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    transport: process.env.NODE_ENV !== 'production'
                        ? { target: 'pino-pretty', options: { singleLine: true } }
                        : undefined,
                },
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => [
                    {
                        ttl: (config.get('THROTTLE_TTL') ?? 60) * 1000,
                        limit: config.get('THROTTLE_LIMIT') ?? 1000,
                    },
                ],
                inject: [config_1.ConfigService],
            }),
            bullmq_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    connection: {
                        host: config.get('REDIS_HOST') || 'localhost',
                        port: config.get('REDIS_PORT') || 6379,
                        password: config.get('REDIS_PASSWORD') || undefined,
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            prisma_module_1.PrismaModule,
            common_module_1.CommonModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            content_module_1.ContentModule,
            categories_module_1.CategoriesModule,
            comments_module_1.CommentsModule,
            likes_module_1.LikesModule,
            subscriptions_module_1.SubscriptionsModule,
            payments_module_1.PaymentsModule,
            review_module_1.ReviewModule,
            notifications_module_1.NotificationsModule,
            email_module_1.EmailModule,
            seo_module_1.SeoModule,
            settings_module_1.SettingsModule,
            contact_module_1.ContactModule,
            newsletter_module_1.NewsletterModule,
            dashboard_module_1.DashboardModule,
            media_module_1.MediaModule,
        ],
        providers: [
            { provide: core_1.APP_FILTER, useClass: http_exception_filter_1.HttpExceptionFilter },
            { provide: core_1.APP_INTERCEPTOR, useClass: response_interceptor_1.ResponseInterceptor },
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map