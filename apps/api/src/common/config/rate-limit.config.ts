import { RateLimitConfig } from '../middleware/rate-limiter.middleware';

/**
 * Rate limit configurations for different endpoints
 */
export const RateLimitConfigs = {
  /**
   * Strict limits for authentication endpoints to prevent brute force attacks
   */
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
    message: 'Too many login attempts. Please try again in 15 minutes.',
  } as RateLimitConfig,

  /**
   * Moderate limits for API endpoints
   */
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Too many requests. Please try again later.',
  } as RateLimitConfig,

  /**
   * Strict limits for file uploads
   */
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // 20 uploads per hour
    message: 'Upload limit exceeded. Please try again later.',
  } as RateLimitConfig,

  /**
   * Very strict limits for password reset to prevent abuse
   */
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 reset attempts per hour
    message: 'Too many password reset requests. Please try again in 1 hour.',
  } as RateLimitConfig,

  /**
   * Strict limits for KYC submissions
   */
  KYC_SUBMISSION: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 5, // 5 KYC submissions per day
    message: 'KYC submission limit exceeded. Please contact support.',
  } as RateLimitConfig,

  /**
   * Moderate limits for investment operations
   */
  INVESTMENT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 investments per hour
    message: 'Investment rate limit exceeded. Please try again later.',
  } as RateLimitConfig,

  /**
   * Strict limits for withdrawal requests
   */
  WITHDRAWAL: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 5, // 5 withdrawals per day
    message: 'Withdrawal limit exceeded. Please try again tomorrow.',
  } as RateLimitConfig,

  /**
   * Lenient limits for read operations
   */
  READ_ONLY: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 300, // 300 requests per 15 minutes
    message: 'Too many requests. Please slow down.',
  } as RateLimitConfig,

  /**
   * Strict limits for email/SMS sending
   */
  NOTIFICATION: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 notifications per hour
    message: 'Notification rate limit exceeded.',
  } as RateLimitConfig,

  /**
   * Very lenient limits for health checks
   */
  HEALTH_CHECK: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    message: 'Health check rate limit exceeded.',
  } as RateLimitConfig,
};

/**
 * Apply rate limits based on user role
 */
export const getRateLimitForRole = (role: string): RateLimitConfig => {
  switch (role) {
    case 'SUPER_ADMIN':
      return {
        windowMs: 15 * 60 * 1000,
        maxRequests: 1000, // Much higher limit for admins
        message: 'Admin rate limit exceeded.',
      };

    case 'ADMIN':
      return {
        windowMs: 15 * 60 * 1000,
        maxRequests: 500,
        message: 'Admin rate limit exceeded.',
      };

    case 'VERIFIED_INVESTOR':
      return {
        windowMs: 15 * 60 * 1000,
        maxRequests: 200, // Higher limit for verified users
        message: 'Rate limit exceeded.',
      };

    default:
      return RateLimitConfigs.API;
  }
};
