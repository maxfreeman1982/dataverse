import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { SentryService } from '../monitoring/sentry.config';

/**
 * Logging interceptor for method-level logging and performance tracking
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('LoggingInterceptor');

  constructor(private sentryService: SentryService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;

    const startTime = Date.now();
    const transaction = this.sentryService.startTransaction(
      `${className}.${handlerName}`,
      'http.server',
    );

    // Add breadcrumb
    this.sentryService.addBreadcrumb({
      message: `Executing ${className}.${handlerName}`,
      category: 'request',
      level: 'info',
      data: {
        method,
        url,
        handler: `${className}.${handlerName}`,
      },
    });

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;

        // Log successful execution
        this.logger.debug(
          `✓ ${className}.${handlerName} executed in ${duration}ms`,
        );

        // Finish transaction
        if (transaction) {
          transaction.setHttpStatus(200);
          transaction.finish();
        }

        // Log performance warning for slow operations
        if (duration > 3000) {
          this.logger.warn(
            `⚠️  SLOW OPERATION: ${className}.${handlerName} took ${duration}ms`,
          );

          this.sentryService.captureMessage(
            `Slow operation: ${className}.${handlerName}`,
            'warning',
            {
              duration,
              method,
              url,
            },
          );
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        // Log error
        this.logger.error(
          `✗ ${className}.${handlerName} failed after ${duration}ms: ${error.message}`,
          error.stack,
        );

        // Capture with Sentry
        this.sentryService.captureException(error, {
          tags: {
            className,
            handlerName,
            method,
            url,
          },
          extra: {
            duration,
            requestBody: request.body,
            requestParams: request.params,
            requestQuery: request.query,
          },
        });

        // Finish transaction with error
        if (transaction) {
          transaction.setHttpStatus(500);
          transaction.finish();
        }

        return throwError(() => error);
      }),
    );
  }
}
