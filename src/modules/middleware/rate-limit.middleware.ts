import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Define custom TooManyRequestsException using BadRequestException (or define your own class if needed)
class TooManyRequestsException extends BadRequestException {
  constructor() {
    super('Too many requests. Please try again later.');
  }
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly requests = new Map<string, number[]>();
  private readonly limit = 100; // max requests per window
  private readonly windowMs = 60 * 1000; // 1 minute window

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    let timestamps = this.requests.get(ip) || [];

    // Filter out timestamps older than windowMs
    timestamps = timestamps.filter((time) => now - time < this.windowMs);

    if (timestamps.length >= this.limit) {
      throw new TooManyRequestsException();
    }

    timestamps.push(now);
    this.requests.set(ip, timestamps);

    next();
  }
}
