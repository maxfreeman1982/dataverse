import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as morgan from 'morgan';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Advanced logging middleware for HTTP requests
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');
  private fileStream: fs.WriteStream;

  constructor() {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Create write stream for access logs
    const accessLogPath = path.join(logsDir, 'access.log');
    this.fileStream = fs.createWriteStream(accessLogPath, { flags: 'a' });
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Get user info if authenticated
    const user = (req as any).user;
    const userId = user?.id || 'anonymous';

    // Log request start
    this.logger.log(`→ ${method} ${originalUrl} - ${ip} - User: ${userId}`);

    // Capture response
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length') || 0;
      const duration = Date.now() - startTime;

      // Determine log level based on status code
      const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';

      // Log response
      const logMessage = `← ${method} ${originalUrl} ${statusCode} - ${duration}ms - ${contentLength} bytes - User: ${userId}`;

      this.logger[logLevel](logMessage);

      // Write to file with more details
      const fileLogMessage = `[${new Date().toISOString()}] ${method} ${originalUrl} ${statusCode} ${duration}ms - IP: ${ip} - User: ${userId} - UA: ${userAgent}\n`;
      this.fileStream.write(fileLogMessage);

      // Track slow requests (> 1 second)
      if (duration > 1000) {
        this.logger.warn(`⚠️  SLOW REQUEST: ${method} ${originalUrl} took ${duration}ms`);
      }
    });

    // Use morgan for additional formatted logging
    morgan('combined', {
      stream: this.fileStream,
      skip: (req, res) => res.statusCode < 400, // Only log errors and warnings to file
    })(req, res, () => {});

    next();
  }
}

/**
 * Custom morgan tokens
 */
export const setupMorganTokens = () => {
  morgan.token('user-id', (req: any) => {
    return req.user?.id || 'anonymous';
  });

  morgan.token('request-body', (req: any) => {
    return JSON.stringify(req.body);
  });
};
