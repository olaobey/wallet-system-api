import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator {
  private readonly redis = new Redis(
    process.env.REDIS_URL || 'redis://localhost:6379',
  );

  async check(key = 'redis'): Promise<HealthIndicatorResult> {
    try {
      const pong = await this.redis.ping();
      const isHealthy = pong === 'PONG';

      if (!isHealthy) {
        throw new Error('Redis ping failed');
      }

      return {
        [key]: {
          status: 'up',
        },
      };
    } catch (error) {
      return {
        [key]: {
          status: 'down',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}
