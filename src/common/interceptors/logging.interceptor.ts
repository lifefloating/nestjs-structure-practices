import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // 检查是否为GraphQL请求
    if (context.getArgs()[3]) {
      // GraphQL的context包含info对象作为第4个参数
      return this.handleGraphQLRequest(context, next);
    }

    // 处理HTTP请求
    return this.handleHTTPRequest(context, next);
  }

  private handleGraphQLRequest(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const now = Date.now();
    const requestId = `gql-${now}-${Math.random().toString(36).substring(2, 15)}`;

    this.logger.log(`GraphQL Request [${requestId}]: ${info.fieldName}`);

    return next.handle().pipe(
      tap({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        next: (_data) => {
          const responseTime = Date.now() - now;
          this.logger.log(`GraphQL Response [${requestId}]: ${info.fieldName} - ${responseTime}ms`);
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `GraphQL Error [${requestId}]: ${info.fieldName} - ${responseTime}ms`,
            error.stack || error,
          );
        },
      }),
    );
  }

  private handleHTTPRequest(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    try {
      const request = context.switchToHttp().getRequest();
      if (!request) {
        return next.handle(); // 如果请求对象不存在，直接处理
      }

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
    } catch (error) {
      // 如果解析请求信息出错，只记录错误并继续处理请求
      this.logger.error('Error in logging interceptor', error.stack || error);
      return next.handle();
    }
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
