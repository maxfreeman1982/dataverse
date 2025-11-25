import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SentryService } from '../monitoring/sentry.config';

/**
 * Global exception filter that captures errors with Sentry
 */
@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);

  constructor(private sentryService: SentryService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determine status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Get error message
    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // Get error response
    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    // Log error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception.stack,
    );

    // Capture with Sentry (only for 5xx errors or unknown errors)
    if (status >= 500 || !(exception instanceof HttpException)) {
      const user = (request as any).user;

      this.sentryService.captureException(exception, {
        user: user
          ? { id: user.id, email: user.email }
          : undefined,
        tags: {
          method: request.method,
          url: request.url,
          status: status.toString(),
        },
        extra: {
          body: request.body,
          params: request.params,
          query: request.query,
          headers: this.sanitizeHeaders(request.headers),
        },
      });
    }

    // Send response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof errorResponse === 'string' ? errorResponse : errorResponse,
    });
  }

  /**
   * Remove sensitive headers before logging
   */
  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
    ];

    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
