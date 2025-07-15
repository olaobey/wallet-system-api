import { HealthIndicatorResult } from '@nestjs/terminus';
export declare class RedisHealthIndicator {
    private readonly redis;
    check(key?: string): Promise<HealthIndicatorResult>;
}
