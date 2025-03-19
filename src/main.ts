import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { contentParser } from 'fastify-multer';
import compression from '@fastify/compress';
import helmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Create Fastify-based NestJS application
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // Get application configuration
  const configService = app.get(ConfigService);
  const port = configService.get('app.port');
  const host = configService.get('app.host');
  const apiPrefix = configService.get('app.apiPrefix');

  // Setup global request validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Setup API versioning
  app.setGlobalPrefix(apiPrefix as string);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Register Fastify plugins
  await app.register(contentParser);
  await app.register(compression);
  await app.register(helmet);
  await app.register(fastifyCors, configService.get('cors'));

  // Setup Swagger API documentation
  if (configService.get('swagger.enabled')) {
    // Generate Swagger OpenAPI document
    const options = new DocumentBuilder()
      .setTitle('NestJS Project API')
      .setDescription('NestJS Project API documentation')
      .setVersion('1.0')
      .addBearerAuth()
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
      routePrefix: 'docs',
    });

    logger.log('Swagger documentation available at /docs');
  }

  // Start the application
  await app.listen(port ?? 3009, host ?? 'localhost');
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap().catch((err) => {
  new Logger('Bootstrap').error(`Failed to start application: ${err.message}`, err.stack);
  process.exit(1);
});
