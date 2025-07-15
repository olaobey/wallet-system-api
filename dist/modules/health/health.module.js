"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthModule = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const health_controller_1 = require("./health.controller");
const terminus_2 = require("@nestjs/terminus");
const terminus_3 = require("@nestjs/terminus");
const redis_indicator_1 = require("./indicators/redis.indicator");
const rabbitmq_indicator_1 = require("./indicators/rabbitmq.indicator");
let HealthModule = class HealthModule {
};
exports.HealthModule = HealthModule;
exports.HealthModule = HealthModule = __decorate([
    (0, common_1.Module)({
        imports: [terminus_1.TerminusModule],
        controllers: [health_controller_1.HealthController],
        providers: [
            terminus_2.TypeOrmHealthIndicator,
            terminus_3.MemoryHealthIndicator,
            redis_indicator_1.RedisHealthIndicator,
            rabbitmq_indicator_1.RabbitMQHealthIndicator,
        ],
    })
], HealthModule);
//# sourceMappingURL=health.module.js.map