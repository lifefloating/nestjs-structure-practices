import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;
    const userAgent = headers['user-agent'] || 'unknown';
    const ip = this.getClientIp(request);

    const now = Date.now();
    const requestId =
      headers['x-request-id'] || `req-${now}-${Math.random().toString(36).substring(2, 15)}`;

    this.logger.log(
      `Request [${requestId}]: ${method} ${url} - ${ip} - ${userAgent}`,
      body && Object.keys(body).length ? JSON.stringify(body) : '',
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `Response [${requestId}]: ${method} ${url} - ${responseTime}ms`,
            data && typeof data === 'object' ? JSON.stringify(data).substring(0, 100) : '',
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `Response Error [${requestId}]: ${method} ${url} - ${responseTime}ms`,
            error.stack || error,
          );
        },
      }),
    );
  }

  private getClientIp(request: Record<string, any>): string {
    return (
      request.headers['x-forwarded-for'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }
}
