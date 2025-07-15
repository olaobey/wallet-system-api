import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WalletService } from '../../wallet/wallet.service';
import { QueueService, QueueMessage } from '../queue.service';
import { DepositDto } from '../../wallet/dto/deposit.dto';
import { WithdrawDto } from '../../wallet/dto/withdraw.dto';
import { TransferDto } from '../../wallet/dto/transfer.dto';
import type { ConsumeMessage, Channel } from 'amqplib';

@Injectable()
export class TransactionProcessor implements OnModuleInit {
  private readonly logger = new Logger(TransactionProcessor.name);
  private readonly maxRetries = 3;

  constructor(
    private readonly walletService: WalletService,
    private readonly queueService: QueueService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.queueService.ready; // ✅ Wait for queue setup
    await this.startProcessing();
  }

  private async startProcessing(): Promise<void> {
    try {
      const channel = this.queueService.getChannel();
      const queueName = this.queueService.getQueueName();

      await channel.prefetch(1);
      await channel.consume(queueName, (msg) => {
        if (msg) {
          void this.processMessage(msg, channel);
        }
      });

      this.logger.log('Transaction processor started');
    } catch (error) {
      this.logger.error(
        'Failed to start transaction processor:',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private async processMessage(
    msg: ConsumeMessage,
    channel: Channel,
  ): Promise<void> {
    try {
      const message: QueueMessage = JSON.parse(msg.content.toString());

      if (!message?.id || !message.type || !message.data) {
        throw new Error('Malformed message');
      }

      this.logger.log(`Processing message: ${message.id}`);
      await this.handleTransaction(message);

      channel.ack(msg);
      this.logger.log(`Message ${message.id} processed successfully`);
    } catch (error) {
      this.logger.error('Error processing message:', error);
      this.handleProcessingError(
        msg,
        channel,
        error instanceof Error ? error : new Error('Unknown error'),
      );
    }
  }

  private async handleTransaction(message: QueueMessage): Promise<void> {
    switch (message.type) {
      case 'deposit':
        await this.walletService.deposit(message.data as DepositDto);
        break;
      case 'withdraw':
        await this.walletService.withdraw(message.data as WithdrawDto);
        break;
      case 'transfer':
        await this.walletService.transfer(message.data as TransferDto);
        break;
      default:
        throw new Error(`Unknown transaction type: ${message.type}`);
    }
  }

  private handleProcessingError(
    msg: ConsumeMessage,
    channel: Channel,
    error: Error,
  ): void {
    const retryCount = (msg.properties.headers?.['x-retry-count'] || 0) + 1;

    if (retryCount <= this.maxRetries) {
      this.logger.warn(
        `Retrying message (attempt ${retryCount}/${this.maxRetries})`,
      );

      channel.sendToQueue(this.queueService.getQueueName(), msg.content, {
        persistent: true,
        messageId: msg.properties.messageId,
        headers: {
          ...msg.properties.headers,
          'x-retry-count': retryCount,
        },
      });
    } else {
      this.logger.error(
        `Max retries reached for message ${msg.properties.messageId}. Sending to DLQ.`,
      );

      channel.sendToQueue('wallet-transactions-dlq', msg.content, {
        persistent: true,
        messageId: msg.properties.messageId,
      });
    }

    channel.ack(msg);
  }
}
