import { HealthIndicatorResult } from '@nestjs/terminus';
export declare class RabbitMQHealthIndicator {
    check(key?: string): Promise<HealthIndicatorResult>;
}
