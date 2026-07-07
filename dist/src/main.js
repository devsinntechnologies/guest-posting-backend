"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const nestjs_pino_1 = require("nestjs-pino");
const path_1 = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        rawBody: true,
        bufferLogs: true,
    });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    const config = app.get(config_1.ConfigService);
    app.set('trust proxy', 1);
    app.enableCors({
        origin: (origin, callback) => {
            const corsOrigins = config.get('CORS_ORIGINS');
            const allowed = corsOrigins === '*'
                ? true
                : [
                    'http://localhost',
                    'http://localhost:80',
                    'http://localhost:3000',
                    'http://localhost:3001',
                    'http://localhost:3002',
                    ...(corsOrigins?.split(',').map((value) => value.trim()) ?? []),
                ];
            if (!origin ||
                allowed === true ||
                (Array.isArray(allowed) && allowed.includes(origin))) {
                callback(null, true);
                return;
            }
            callback(null, false);
        },
        credentials: true,
    });
    const prefix = config.get('API_PREFIX') || 'api/v1';
    app.setGlobalPrefix(prefix);
    const uploadPath = config.get('UPLOAD_LOCAL_PATH') || './uploads';
    app.useStaticAssets((0, path_1.join)(process.cwd(), uploadPath), { prefix: '/uploads' });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Devsinn Insights API')
        .setDescription('REST API for Devsinn Insights — moderated publishing and content creation platform')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = config.get('PORT') || 3000;
    await app.listen(port);
    console.log(`Application running on http://localhost:${port}/${prefix}`);
    console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
void bootstrap();
//# sourceMappingURL=main.js.map