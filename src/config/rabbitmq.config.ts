import { registerAs } from '@nestjs/config';

export const rabbitmqConfig = registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  queue: {
    transaction: process.env.RABBITMQ_TRANSACTION_QUEUE,
    deadLetter: process.env.RABBITMQ_QUEUE_DEADLETTER,
  },
}));
