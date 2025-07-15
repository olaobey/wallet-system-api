import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { Connection, Channel } from 'amqplib';
import { ConfigService } from '@nestjs/config';

export interface QueueMessage {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  data: unknown;
  timestamp: Date;
  retryCount?: number;
}

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly queueName = 'wallet-transactions';
  private readonly dlqName = 'wallet-transactions-dlq';

  private readyResolver!: () => void;
  public readonly ready: Promise<void>;

  constructor(private configService: ConfigService) {
    this.ready = new Promise((resolve) => {
      this.readyResolver = resolve;
    });
  }

  async onModuleInit() {
    await this.connect();
    await this.setupQueues();
    this.logger.log('QueueService initialized');
    this.readyResolver(); // ✅ signal readiness
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      const rabbitMQUrl = this.configService.get<string>(
        'RABBITMQ_URL',
        'amqp://localhost',
      );
      this.connection = await amqp.connect(rabbitMQUrl);
      this.channel = await this.connection.createChannel();

      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error:', err);
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
      });

      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  private async setupQueues(): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    try {
      await this.channel.assertQueue(this.queueName, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': this.dlqName,
        },
      });

      await this.channel.assertQueue(this.dlqName, {
        durable: true,
      });

      this.logger.log('Queues setup completed');
    } catch (error) {
      this.logger.error('Failed to setup queues:', error);
      throw error;
    }
  }

  addToQueue(message: QueueMessage): void {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    const messageBuffer = Buffer.from(JSON.stringify(message));
    const success = this.channel.sendToQueue(this.queueName, messageBuffer, {
      persistent: true,
      messageId: message.id,
      timestamp: Date.now(),
    });

    if (success) {
      this.logger.log(`Message ${message.id} added to queue`);
    } else {
      this.logger.warn(`Failed to add message ${message.id} - buffer full`);
    }
  }

  getChannel(): Channel {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }
    return this.channel;
  }

  getQueueName(): string {
    return this.queueName;
  }

  private async disconnect(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ:', error);
    }
  }
}
