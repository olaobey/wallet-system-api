"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TransactionProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionProcessor = void 0;
const common_1 = require("@nestjs/common");
const wallet_service_1 = require("../../wallet/wallet.service");
const queue_service_1 = require("../queue.service");
let TransactionProcessor = TransactionProcessor_1 = class TransactionProcessor {
    constructor(walletService, queueService) {
        this.walletService = walletService;
        this.queueService = queueService;
        this.logger = new common_1.Logger(TransactionProcessor_1.name);
        this.maxRetries = 3;
    }
    async onModuleInit() {
        await this.queueService.ready;
        await this.startProcessing();
    }
    async startProcessing() {
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
        }
        catch (error) {
            this.logger.error('Failed to start transaction processor:', error instanceof Error ? error.message : String(error));
        }
    }
    async processMessage(msg, channel) {
        try {
            const message = JSON.parse(msg.content.toString());
            if (!message?.id || !message.type || !message.data) {
                throw new Error('Malformed message');
            }
            this.logger.log(`Processing message: ${message.id}`);
            await this.handleTransaction(message);
            channel.ack(msg);
            this.logger.log(`Message ${message.id} processed successfully`);
        }
        catch (error) {
            this.logger.error('Error processing message:', error);
            this.handleProcessingError(msg, channel, error instanceof Error ? error : new Error('Unknown error'));
        }
    }
    async handleTransaction(message) {
        switch (message.type) {
            case 'deposit':
                await this.walletService.deposit(message.data);
                break;
            case 'withdraw':
                await this.walletService.withdraw(message.data);
                break;
            case 'transfer':
                await this.walletService.transfer(message.data);
                break;
            default:
                throw new Error(`Unknown transaction type: ${message.type}`);
        }
    }
    handleProcessingError(msg, channel, error) {
        const retryCount = (msg.properties.headers?.['x-retry-count'] || 0) + 1;
        if (retryCount <= this.maxRetries) {
            this.logger.warn(`Retrying message (attempt ${retryCount}/${this.maxRetries})`);
            channel.sendToQueue(this.queueService.getQueueName(), msg.content, {
                persistent: true,
                messageId: msg.properties.messageId,
                headers: {
                    ...msg.properties.headers,
                    'x-retry-count': retryCount,
                },
            });
        }
        else {
            this.logger.error(`Max retries reached for message ${msg.properties.messageId}. Sending to DLQ.`);
            channel.sendToQueue('wallet-transactions-dlq', msg.content, {
                persistent: true,
                messageId: msg.properties.messageId,
            });
        }
        channel.ack(msg);
    }
};
exports.TransactionProcessor = TransactionProcessor;
exports.TransactionProcessor = TransactionProcessor = TransactionProcessor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [wallet_service_1.WalletService,
        queue_service_1.QueueService])
], TransactionProcessor);
//# sourceMappingURL=transaction.processor.js.map