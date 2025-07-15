import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQHealthIndicator {
  async check(key = 'rabbitmq'): Promise<HealthIndicatorResult> {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost';
    try {
      const connection = await amqp.connect(url);
      await connection.close();
      return {
        [key]: {
          status: 'up',
        },
      };
    } catch (error: unknown) {
      return {
        [key]: {
          status: 'down',
          message: (error as any).message || 'RabbitMQ connection failed',
        },
      };
    }
  }
}
