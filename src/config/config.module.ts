import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import defaultConfig from './envs/default';
import developmentConfig from './envs/development';
import productionConfig from './envs/production';

const configModuleOptions = {
  isGlobal: true,
  envFilePath: '.env',
  load: [
    () => defaultConfig,
    () => (process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig),
  ],
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(3000),
    HOST: Joi.string().default('localhost'),
    API_PREFIX: Joi.string().default('api'),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().default('30d'),
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('90d'),
  }),
  validationOptions: {
    allowUnknown: true,
    abortEarly: false,
  },
};

@Module({
  imports: [NestConfigModule.forRoot(configModuleOptions)],
  exports: [NestConfigModule],
})
export class ConfigModule {}
