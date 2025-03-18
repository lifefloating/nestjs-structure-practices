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
    const statusCode = context.switchToHttp().getResponse().statusCode;

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
