import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { StorageModule } from './storage/storage.module';
import { LoggerModule } from './logger/loggeer.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CommonModule,
    UsersModule,
    StorageModule.register(),
    LoggerModule,
  ],
})
export class AppModule {}
