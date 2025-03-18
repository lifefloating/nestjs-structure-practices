import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [ConfigModule, PrismaModule, CommonModule, UsersModule],
})
export class AppModule {}
