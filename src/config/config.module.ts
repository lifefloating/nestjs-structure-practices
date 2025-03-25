import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import defaultConfig from './envs/default';
import developmentConfig from './envs/development';
import productionConfig from './envs/production';
import { ConfigService } from './config.service';

// Create different schemas based on environment
const createSchemaForEnv = (isProd: boolean) => {
  // Base schema for all environments
  const baseSchema = {
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(7009),
    HOST: Joi.string().default('localhost'),
    API_PREFIX: Joi.string().default('api'),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().default('30d'),
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('90d'),
    STORAGE_PROVIDER: Joi.string().valid('s3', 'alioss', 'tencentoss').default('s3'),
    STORAGE_BUCKET: Joi.string().default('my-bucket'),
    STORAGE_REGION: Joi.string().required(),
    STORAGE_ENDPOINT: Joi.string().required(),
    STORAGE_ACCESS_KEY_ID: Joi.string().required(),
    STORAGE_ACCESS_KEY_SECRET: Joi.string().required(),
    STORAGE_BASE_URL: Joi.string().optional(),
    STORAGE_MAX_FILE_SIZE: Joi.number().default(10485760),
    STORAGE_ALLOWED_MIME_TYPES: Joi.string().default(
      'image/jpeg,image/png,image/gif,application/pdf',
    ),
    STRIPE_SECRET_KEY: Joi.string().required(),
    STRIPE_PUBLIC_KEY: Joi.string().required(),
    STRIPE_WEBHOOK_SECRET: Joi.string().required(),
    STRIPE_API_VERSION: Joi.string().required(),
  };

  // Datadog schema varies by environment
  if (isProd) {
    return Joi.object({
      ...baseSchema,
      DATADOG_API_KEY: Joi.string().required(),
      DATADOG_SERVICE_NAME: Joi.string().required(),
      DATADOG_HOST_NAME: Joi.string().required(),
      DATADOG_INTAKE_REGION: Joi.string().valid('us5', 'eu', 'us3').required(),
    });
  } else {
    return Joi.object({
      ...baseSchema,
      DATADOG_API_KEY: Joi.string().optional().default('dummy-api-key'),
      DATADOG_SERVICE_NAME: Joi.string().optional().default('my-service'),
      DATADOG_HOST_NAME: Joi.string().optional().default('host-name'),
      DATADOG_INTAKE_REGION: Joi.string().valid('us5', 'eu', 'us3').optional().default('us5'),
    });
  }
};

const configModuleOptions = {
  isGlobal: true,
  envFilePath: '.env',
  load: [
    () => defaultConfig,
    () => (process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig),
  ],
  validationSchema: createSchemaForEnv(process.env.NODE_ENV === 'production'),
  validationOptions: {
    allowUnknown: true,
    abortEarly: false,
  },
};

@Module({
  imports: [NestConfigModule.forRoot(configModuleOptions)],
  providers: [ConfigService],
  exports: [NestConfigModule, ConfigService],
})
export class ConfigModule {}
