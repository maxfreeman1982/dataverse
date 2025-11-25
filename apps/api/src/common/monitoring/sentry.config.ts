import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Sentry monitoring configuration for error tracking and performance monitoring
 */
@Injectable()
export class SentryService {
  private readonly logger = new Logger(SentryService.name);
  private isInitialized = false;

  constructor(private configService: ConfigService) {
    this.initialize();
  }

  /**
   * Initialize Sentry with environment configuration
   */
  private initialize(): void {
    const dsn = this.configService.get<string>('SENTRY_DSN');
    const environment = this.configService.get<string>('NODE_ENV', 'development');
    const release = this.configService.get<string>('APP_VERSION', '1.0.0');

    if (!dsn) {
      this.logger.warn('Sentry DSN not configured. Error tracking disabled.');
      return;
    }

    try {
      Sentry.init({
        dsn,
        environment,
        release: `oj-investment-platform@${release}`,

        // Performance monitoring
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
        profilesSampleRate: environment === 'production' ? 0.1 : 1.0,

        // Integrations
        integrations: [
          new ProfilingIntegration(),
          new Sentry.Integrations.Http({ tracing: true }),
          new Sentry.Integrations.Postgres(),
        ],

        // Filter sensitive data
        beforeSend(event, hint) {
          // Remove sensitive information from errors
          if (event.request) {
            // Remove authorization headers
            if (event.request.headers) {
              delete event.request.headers['authorization'];
              delete event.request.headers['cookie'];
            }

            // Remove sensitive query parameters
            if (event.request.query_string) {
              const sensitiveParams = ['token', 'password', 'apiKey', 'secret'];
              sensitiveParams.forEach(param => {
                if (event.request.query_string.includes(param)) {
                  event.request.query_string = '[REDACTED]';
                }
              });
            }
          }

          // Remove sensitive data from extra context
          if (event.extra) {
            const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
            sensitiveKeys.forEach(key => {
              if (event.extra[key]) {
                event.extra[key] = '[REDACTED]';
              }
            });
          }

          return event;
        },

        // Ignore certain errors
        ignoreErrors: [
          'ECONNREFUSED',
          'ETIMEDOUT',
          'AbortError',
          'CancelledError',
          /NetworkError/i,
        ],

        // Set user context
        initialScope: {
          tags: {
            service: 'api',
            platform: 'backend',
          },
        },
      });

      this.isInitialized = true;
      this.logger.log(`Sentry initialized (${environment})`);
    } catch (error) {
      this.logger.error('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Capture an exception with Sentry
   */
  captureException(
    error: Error,
    context?: {
      user?: { id: string; email: string };
      tags?: Record<string, string>;
      extra?: Record<string, any>;
    },
  ): void {
    if (!this.isInitialized) return;

    Sentry.withScope((scope) => {
      // Set user context
      if (context?.user) {
        scope.setUser({
          id: context.user.id,
          email: context.user.email,
        });
      }

      // Set tags
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }

      // Set extra context
      if (context?.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }

      Sentry.captureException(error);
    });
  }

  /**
   * Capture a message with Sentry
   */
  captureMessage(
    message: string,
    level: Sentry.SeverityLevel = 'info',
    context?: Record<string, any>,
  ): void {
    if (!this.isInitialized) return;

    Sentry.withScope((scope) => {
      scope.setLevel(level);

      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }

      Sentry.captureMessage(message);
    });
  }

  /**
   * Start a transaction for performance monitoring
   */
  startTransaction(name: string, operation: string): Sentry.Transaction {
    if (!this.isInitialized) {
      return null;
    }

    return Sentry.startTransaction({
      name,
      op: operation,
    });
  }

  /**
   * Set user context for current scope
   */
  setUser(user: { id: string; email: string; role?: string }): void {
    if (!this.isInitialized) return;

    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    if (!this.isInitialized) return;
    Sentry.setUser(null);
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: Sentry.SeverityLevel;
    data?: Record<string, any>;
  }): void {
    if (!this.isInitialized) return;

    Sentry.addBreadcrumb({
      message: breadcrumb.message,
      category: breadcrumb.category || 'custom',
      level: breadcrumb.level || 'info',
      data: breadcrumb.data,
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Track a custom event
   */
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.isInitialized) return;

    this.addBreadcrumb({
      message: eventName,
      category: 'event',
      level: 'info',
      data: properties,
    });
  }

  /**
   * Flush pending events (useful before shutdown)
   */
  async flush(timeout = 2000): Promise<boolean> {
    if (!this.isInitialized) return true;
    return await Sentry.close(timeout);
  }
}
