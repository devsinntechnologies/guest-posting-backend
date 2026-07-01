import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CACHEABLE_KEY } from '../decorators/roles.decorator';
import { Response } from 'express';
import { createHash } from 'crypto';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const cacheMaxAge = this.reflector.getAllAndOverride<number>(
      CACHEABLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    return next.handle().pipe(
      map((result) => {
        const response = context.switchToHttp().getResponse<Response>();

        if (cacheMaxAge) {
          response.setHeader('Cache-Control', `public, max-age=${cacheMaxAge}`);
          const etag = createHash('md5')
            .update(JSON.stringify(result))
            .digest('hex');
          response.setHeader('ETag', `"${etag}"`);
        }

        if (
          result &&
          typeof result === 'object' &&
          'items' in result &&
          'total' in result
        ) {
          const paginated = result as {
            items: T;
            total: number;
            page: number;
            limit: number;
            totalPages: number;
          };
          return {
            success: true,
            data: paginated.items,
            meta: {
              total: paginated.total,
              page: paginated.page,
              limit: paginated.limit,
              totalPages: paginated.totalPages,
            },
          };
        }

        return { success: true, data: result as T };
      }),
    );
  }
}
