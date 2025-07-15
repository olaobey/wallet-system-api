"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rabbitmqConfig = void 0;
const config_1 = require("@nestjs/config");
exports.rabbitmqConfig = (0, config_1.registerAs)('rabbitmq', () => ({
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    queue: {
        transaction: process.env.RABBITMQ_TRANSACTION_QUEUE,
        deadLetter: process.env.RABBITMQ_QUEUE_DEADLETTER,
    },
}));
//# sourceMappingURL=rabbitmq.config.js.map