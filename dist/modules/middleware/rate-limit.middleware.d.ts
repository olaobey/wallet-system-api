import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class RateLimitMiddleware implements NestMiddleware {
    private readonly requests;
    private readonly limit;
    private readonly windowMs;
    use(req: Request, res: Response, next: NextFunction): void;
}
