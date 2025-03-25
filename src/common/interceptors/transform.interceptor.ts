import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta?: Record<string, unknown>;
  statusCode: number;
  message: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    // 检查是否为GraphQL请求，如果是，跳过转换
    if (context.getArgs()[3]) {
      // GraphQL请求的第3个参数是GraphQL的info对象
      return next.handle();
    }

    // 处理HTTP请求
    const httpContext = context.switchToHttp();
    if (!httpContext.getResponse()) {
      // 如果不是HTTP请求且没有response对象，直接返回原始结果
      return next.handle();
    }

    const statusCode = httpContext.getResponse().statusCode;

    return next.handle().pipe(
      map((data) => {
        // If the data is already of type Response, return it as is
        if (data && typeof data === 'object' && 'statusCode' in data && 'data' in data) {
          return data;
        }

        // For pagination results
        if (data && typeof data === 'object' && 'items' in data && 'meta' in data) {
          return {
            data: data.items,
            meta: data.meta,
            statusCode,
            message: 'Success',
          };
        }

        // Normal response
        return {
          data,
          statusCode,
          message: 'Success',
        };
      }),
    );
  }
}
