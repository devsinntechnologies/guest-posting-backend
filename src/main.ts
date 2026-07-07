import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);

  // Trust nginx reverse proxy (required for correct client IP / rate limiting)
  app.set('trust proxy', 1);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      const corsOrigins = config.get<string>('CORS_ORIGINS');
      const allowed =
        corsOrigins === '*'
          ? true
          : [
              'http://localhost',
              'http://localhost:80',
              'http://localhost:3000',
              'http://localhost:3001',
              'http://localhost:3002',
              ...(corsOrigins?.split(',').map((value) => value.trim()) ?? []),
            ];

      if (
        !origin ||
        allowed === true ||
        (Array.isArray(allowed) && allowed.includes(origin))
      ) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  });

  const prefix = config.get<string>('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(prefix);

  const uploadPath = config.get<string>('UPLOAD_LOCAL_PATH') || './uploads';
  app.useStaticAssets(join(process.cwd(), uploadPath), { prefix: '/uploads' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Devsinn Insights API')
    .setDescription(
      'REST API for Devsinn Insights — moderated publishing and content creation platform',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`Application running on http://localhost:${port}/${prefix}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

void bootstrap();
