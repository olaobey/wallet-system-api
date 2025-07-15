import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Channel } from 'amqplib';
import { ConfigService } from '@nestjs/config';
export interface QueueMessage {
    id: string;
    type: 'deposit' | 'withdraw' | 'transfer';
    data: unknown;
    timestamp: Date;
    retryCount?: number;
}
export declare class QueueService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private readonly logger;
    private connection;
    private channel;
    private readonly queueName;
    private readonly dlqName;
    private readyResolver;
    readonly ready: Promise<void>;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private connect;
    private setupQueues;
    addToQueue(message: QueueMessage): void;
    getChannel(): Channel;
    getQueueName(): string;
    private disconnect;
}
