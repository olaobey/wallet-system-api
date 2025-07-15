"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisHealthIndicator = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisHealthIndicator = class RedisHealthIndicator {
    constructor() {
        this.redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
    }
    async check(key = 'redis') {
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
        }
        catch (error) {
            return {
                [key]: {
                    status: 'down',
                    message: error instanceof Error ? error.message : 'Unknown error',
                },
            };
        }
    }
};
exports.RedisHealthIndicator = RedisHealthIndicator;
exports.RedisHealthIndicator = RedisHealthIndicator = __decorate([
    (0, common_1.Injectable)()
], RedisHealthIndicator);
//# sourceMappingURL=redis.indicator.js.map