import { SetMetadata } from '@nestjs/common';
import { RateLimitConfig } from '../middleware/rate-limiter.middleware';

export const RATE_LIMIT_KEY = 'rateLimit';

/**
 * Decorator to apply rate limiting to specific routes
 *
 * @example
 * ```typescript
 * @RateLimit({ windowMs: 60000, maxRequests: 10 })
 * @Post('login')
 * async login() { ... }
 * ```
 */
export const RateLimit = (config: RateLimitConfig) =>
  SetMetadata(RATE_LIMIT_KEY, config);

/**
 * Predefined rate limit decorators for common use cases
 */
export const StrictRateLimit = () =>
  RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many requests. Please try again later.',
  });

export const ModerateRateLimit = () =>
  RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50,
    message: 'Rate limit exceeded. Please try again later.',
  });

export const LenientRateLimit = () =>
  RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200,
    message: 'Rate limit exceeded. Please slow down.',
  });
