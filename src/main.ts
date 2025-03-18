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

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Create Fastify-based NestJS application
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // Get application configuration
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');
  const host = configService.get<string>('app.host');
  const apiPrefix = configService.get<string>('app.apiPrefix');

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
  app.setGlobalPrefix(apiPrefix);
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
  if (configService.get<boolean>('swagger.enabled')) {
    const swaggerConfig = configService.get('swagger');
    const options = new DocumentBuilder()
      .setTitle(swaggerConfig.title)
      .setDescription(swaggerConfig.description)
      .setVersion(swaggerConfig.version)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(swaggerConfig.path, app, document);

    logger.log(`Swagger documentation available at /${swaggerConfig.path}`);
  }

  // Start the application
  await app.listen(port, host);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap().catch((err) => {
  new Logger('Bootstrap').error(`Failed to start application: ${err.message}`, err.stack);
  process.exit(1);
});
