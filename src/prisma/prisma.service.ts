import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '../config/config.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.getDatabaseConfig().url,
        },
      },
      log: ['error', 'warn'],
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to the database');
    } catch (error) {
      this.logger.error(`Failed to connect to the database: ${error.message}`, error.stack);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      this.logger.log('Successfully disconnected from the database');
    } catch (error) {
      this.logger.error(`Failed to disconnect from the database: ${error.message}`, error.stack);
      throw error;
    }
  }
}
