import { Injectable, Logger } from '@nestjs/common';
import pino from 'pino';
import { ConfigService } from '@app/config/config.service';

@Injectable()
export class LoggerService extends Logger {
  private readonly pinoInstance: any;

  constructor(private readonly config: ConfigService) {
    super();

    const datadog = this.config.getDatadogConfig();

    this.pinoInstance = pino({
      level: 'info',
      transport: {
        targets: [
          // Console transport for local logs
          {
            target: 'pino-pretty',
            level: 'info',
            options: {
              colorize: true,
            },
          },
          // Datadog transport for remote logs
          {
            target: 'pino-datadog-transport',
            level: 'info',
            options: {
              apiKey: datadog.apiKey,
              ddsource: 'nodejs',
              service: datadog.serviceName,
              hostname: datadog.hostName,
              site: datadog.intakeRegion,
              ddtags: `env:${process.env.NODE_ENV}`,
            },
          },
        ],
      },
    });
  }

  log(message: string): void {
    super.log(message);
    this.pinoInstance.info(message);
  }

  error(message: string, trace: string): void {
    super.error(message, trace);
    this.pinoInstance.error({ message, trace });
  }

  warn(message: string): void {
    super.warn(message);
    this.pinoInstance.warn(message);
  }
}
