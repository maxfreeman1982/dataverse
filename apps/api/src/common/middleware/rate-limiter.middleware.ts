import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import * as redis from 'redis';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private redisClient: redis.RedisClientType;
  private config: RateLimitConfig;

  constructor(private configService: ConfigService) {
    // Default configuration
    this.config = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // 100 requests per window
      message: 'Too many requests, please try again later.',
    };

    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    const redisUrl = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');

    try {
      this.redisClient = redis.createClient({ url: redisUrl });
      await this.redisClient.connect();
      console.log('Rate limiter Redis client connected');
    } catch (error) {
      console.warn('Rate limiter: Redis connection failed, using in-memory fallback');
    }
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const identifier = this.getIdentifier(req);
      const key = `rate_limit:${identifier}`;

      if (!this.redisClient?.isOpen) {
        // Redis not available, skip rate limiting
        return next();
      }

      // Get current count
      const currentCount = await this.redisClient.get(key);
      const requests = currentCount ? parseInt(currentCount, 10) : 0;

      if (requests >= this.config.maxRequests) {
        // Rate limit exceeded
        const ttl = await this.redisClient.ttl(key);

        res.set({
          'X-RateLimit-Limit': this.config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + ttl * 1000).toISOString(),
        });

        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: this.config.message,
            error: 'Too Many Requests',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Increment counter
      if (requests === 0) {
        // First request in window
        await this.redisClient.set(key, '1', {
          EX: Math.floor(this.config.windowMs / 1000),
        });
      } else {
        await this.redisClient.incr(key);
      }

      // Set rate limit headers
      const remaining = this.config.maxRequests - requests - 1;
      res.set({
        'X-RateLimit-Limit': this.config.maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
      });

      next();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // If rate limiting fails, allow the request through
      next();
    }
  }

  /**
   * Get unique identifier for the request (IP or user ID)
   */
  private getIdentifier(req: Request): string {
    // Try to get user ID from authenticated request
    const user = (req as any).user;
    if (user?.id) {
      return `user:${user.id}`;
    }

    // Fall back to IP address
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
      ? (forwarded as string).split(',')[0].trim()
      : req.socket.remoteAddress;

    return `ip:${ip}`;
  }

  /**
   * Configure rate limiter
   */
  configure(config: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
