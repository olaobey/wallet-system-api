"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const amqp = __importStar(require("amqplib"));
const config_1 = require("@nestjs/config");
let QueueService = QueueService_1 = class QueueService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(QueueService_1.name);
        this.connection = null;
        this.channel = null;
        this.queueName = 'wallet-transactions';
        this.dlqName = 'wallet-transactions-dlq';
        this.ready = new Promise((resolve) => {
            this.readyResolver = resolve;
        });
    }
    async onModuleInit() {
        await this.connect();
        await this.setupQueues();
        this.logger.log('QueueService initialized');
        this.readyResolver();
    }
    async onModuleDestroy() {
        await this.disconnect();
    }
    async connect() {
        try {
            const rabbitMQUrl = this.configService.get('RABBITMQ_URL', 'amqp://localhost');
            this.connection = await amqp.connect(rabbitMQUrl);
            this.channel = await this.connection.createChannel();
            this.connection.on('error', (err) => {
                this.logger.error('RabbitMQ connection error:', err);
            });
            this.connection.on('close', () => {
                this.logger.warn('RabbitMQ connection closed');
            });
            this.logger.log('Connected to RabbitMQ');
        }
        catch (error) {
            this.logger.error('Failed to connect to RabbitMQ:', error);
            throw error;
        }
    }
    async setupQueues() {
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
        }
        catch (error) {
            this.logger.error('Failed to setup queues:', error);
            throw error;
        }
    }
    addToQueue(message) {
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
        }
        else {
            this.logger.warn(`Failed to add message ${message.id} - buffer full`);
        }
    }
    getChannel() {
        if (!this.channel) {
            throw new Error('Channel not initialized');
        }
        return this.channel;
    }
    getQueueName() {
        return this.queueName;
    }
    async disconnect() {
        try {
            if (this.channel)
                await this.channel.close();
            if (this.connection)
                await this.connection.close();
            this.logger.log('Disconnected from RabbitMQ');
        }
        catch (error) {
            this.logger.error('Error disconnecting from RabbitMQ:', error);
        }
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QueueService);
//# sourceMappingURL=queue.service.js.map