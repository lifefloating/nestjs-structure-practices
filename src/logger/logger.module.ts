import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { ConfigModule } from '@app/config/config.module';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
