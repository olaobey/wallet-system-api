import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';
import { MemoryHealthIndicator } from '@nestjs/terminus';
import { RedisHealthIndicator } from './indicators/redis.indicator';
import { RabbitMQHealthIndicator } from './indicators/rabbitmq.indicator';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [
    TypeOrmHealthIndicator,
    MemoryHealthIndicator,
    RedisHealthIndicator,
    RabbitMQHealthIndicator,
  ],
})
export class HealthModule {}
