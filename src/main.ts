import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import compression from '@fastify/compress';
import helmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyMultipart from '@fastify/multipart';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Create Fastify-based NestJS application
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // Get application configuration
  const configService = app.get(ConfigService);
  const appConfig = configService.getAppConfig();
  logger.log(`Application configuration: ${JSON.stringify(appConfig)}`);
  const port = appConfig.port;
  const host = appConfig.host;
  const apiPrefix = appConfig.apiPrefix;
  const swaggerConfig = configService.getSwaggerConfig();

  // Setup global request validation
  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: false,
    }),
  );
  // Setup API versioning
  app.setGlobalPrefix(apiPrefix as string, {
    exclude: swaggerConfig?.path ? [swaggerConfig.path] : [],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Register Fastify plugins
  await app.register(compression);
  await app.register(helmet);
  await app.register(fastifyCors, configService.getCorsConfig());

  // Register multipart plugin for file uploads with configuration from storage settings
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: configService.getStorageConfig().maxFileSize,
      files: 1, // Limit to one file per request by default
    },
    attachFieldsToBody: false, // Don't automatically attach fields to body
  });

  // Setup Swagger API documentation
  if (swaggerConfig?.enabled) {
    const apiDocVersion = process.env.API_DOC_VERSION || swaggerConfig?.version || '1.0.0';

    // Generate Swagger OpenAPI document
    const options = new DocumentBuilder()
      .setTitle(swaggerConfig?.title || 'API Documentation')
      .setDescription(swaggerConfig?.description || 'API Documentation Description')
      .addBearerAuth()
      .setVersion(apiDocVersion)
      .build();

    const document = SwaggerModule.createDocument(app, options);

    // Register Fastify Swagger
    await app.register(fastifySwagger, {
      mode: 'static',
      specification: {
        document: document as any,
      },
    });

    // Register Swagger UI
    await app.register(fastifySwaggerUi, {
      routePrefix: swaggerConfig?.path || 'apidoc',
    });

    logger.log(`Swagger documentation available at /${swaggerConfig?.path || 'apidoc'}`);
  }

  // Start the application
  await app.listen(port ?? 7009, host ?? 'localhost');
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap().catch((err) => {
  new Logger('Bootstrap').error(`Failed to start application: ${err.message}`, err.stack);
  process.exit(1);
});
