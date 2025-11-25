import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as redis from 'redis';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator';
import { RateLimitConfig } from '../middleware/rate-limiter.middleware';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private redisClient: redis.RedisClientType;

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {
    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    const redisUrl = this.configService.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );

    try {
      this.redisClient = redis.createClient({ url: redisUrl });
      await this.redisClient.connect();
    } catch (error) {
      console.warn('Rate limit guard: Redis connection failed');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get rate limit config from decorator
    const config = this.reflector.get<RateLimitConfig>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!config) {
      // No rate limit configured for this route
      return true;
    }

    if (!this.redisClient?.isOpen) {
      // Redis not available, allow request
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const identifier = this.getIdentifier(request);
    const route = `${request.method}:${request.route?.path || request.path}`;
    const key = `rate_limit:${route}:${identifier}`;

    try {
      // Get current count
      const currentCount = await this.redisClient.get(key);
      const requests = currentCount ? parseInt(currentCount, 10) : 0;

      if (requests >= config.maxRequests) {
        // Rate limit exceeded
        const ttl = await this.redisClient.ttl(key);

        response.set({
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(
            Date.now() + ttl * 1000,
          ).toISOString(),
        });

        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: config.message || 'Too many requests',
            error: 'Too Many Requests',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Increment counter
      if (requests === 0) {
        // First request in window
        await this.redisClient.set(key, '1', {
          EX: Math.floor(config.windowMs / 1000),
        });
      } else {
        await this.redisClient.incr(key);
      }

      // Set rate limit headers
      const remaining = config.maxRequests - requests - 1;
      response.set({
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
      });

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // If rate limiting fails, allow the request
      return true;
    }
  }

  /**
   * Get unique identifier for the request
   */
  private getIdentifier(request: any): string {
    // Try to get user ID from authenticated request
    const user = request.user;
    if (user?.id) {
      return `user:${user.id}`;
    }

    // Fall back to IP address
    const forwarded = request.headers['x-forwarded-for'];
    const ip = forwarded
      ? (forwarded as string).split(',')[0].trim()
      : request.socket.remoteAddress;

    return `ip:${ip}`;
  }
}
