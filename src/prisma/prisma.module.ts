import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigService } from '../config/config.service';

@Global()
@Module({
  providers: [PrismaService, ConfigService],
  exports: [PrismaService],
})
export class PrismaModule {}
