import { Injectable, Logger } from '@nestjs/common';
import * as winston from 'winston';
import DatadogTransport from 'datadog-winston';
import { ConfigService } from '@app/config/config.service';

@Injectable()
export class LoggerService extends Logger {
  private readonly winstonLogger: winston.Logger;

  constructor(private readonly config: ConfigService) {
    super(); // 调用父类的构造函数
    const withErrorField = winston.format((info) => {
      if (info instanceof Error) {
        return Object.assign({}, info, {
          error: {
            kind: info.name,
            message: info.message,
            stack: info.stack,
          },
        });
      }

      return info;
    });
    // 初始化 winston logger
    const datadog = this.config.getDatadogConfig();
    this.winstonLogger = winston.createLogger({
      level: 'info', // 设置日志级别// 设置日志格式
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            withErrorField(),
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.json(),
          ),
        }),
        new DatadogTransport({
          intakeRegion: datadog.intakeRegion,
          apiKey: datadog.apiKey,
          hostname: datadog.hostName,
          service: datadog.serviceName,
          ddsource: 'nginx',
          ddtags: `env:${process.env.NODE_ENV}`,
        }),
      ],
    });
  }

  // 重写 log 方法，将日志同时输出到 console 和 datadog
  log(message: string) {
    super.log(message); // 调用父类的 log 方法，输出日志到控制台
    this.winstonLogger.info(message); // 将日志发送到 Datadog
  }

  // 重写 error 方法，将错误日志同时输出到 console 和 datadog
  error(message: string, trace: string) {
    super.error(message, trace); // 调用父类的 error 方法，输出日志到控制台
    this.winstonLogger.error(message); // 将错误日志发送到 Datadog
  }

  // 重写 warn 方法，将警告日志同时输出到 console 和 datadog
  warn(message: string) {
    super.warn(message); // 调用父类的 warn 方法，输出日志到控制台
    this.winstonLogger.warn(message); // 将警告日志发送到 Datadog
  }
}
