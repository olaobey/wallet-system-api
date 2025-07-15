import { HealthCheckService, TypeOrmHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { RedisHealthIndicator } from './indicators/redis.indicator';
import { RabbitMQHealthIndicator } from './indicators/rabbitmq.indicator';
export declare class HealthController {
    private health;
    private db;
    private memory;
    private redis;
    private rabbit;
    constructor(health: HealthCheckService, db: TypeOrmHealthIndicator, memory: MemoryHealthIndicator, redis: RedisHealthIndicator, rabbit: RabbitMQHealthIndicator);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
