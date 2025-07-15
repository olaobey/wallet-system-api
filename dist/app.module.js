"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const throttler_1 = require("@nestjs/throttler");
const config_1 = require("@nestjs/config");
const cache_manager_redis_yet_1 = require("cache-manager-redis-yet");
const auth_module_1 = require("./modules/auth/auth.module");
const user_module_1 = require("./modules/user/user.module");
const wallet_module_1 = require("./modules/wallet/wallet.module");
const transaction_module_1 = require("./modules/transaction/transaction.module");
const queue_module_1 = require("./modules/queue/queue.module");
const database_config_1 = require("./config/database.config");
const redis_config_1 = require("./config/redis.config");
const rate_limit_middleware_1 = require("./modules/middleware/rate-limit.middleware");
const health_module_1 = require("./modules/health/health.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(rate_limit_middleware_1.RateLimitMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [database_config_1.databaseConfig, redis_config_1.redisConfig],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('database.host'),
                    port: configService.get('database.port'),
                    username: configService.get('database.username'),
                    password: configService.get('database.password'),
                    database: configService.get('database.database'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: configService.get('database.synchronize'),
                    logging: configService.get('database.logging'),
                }),
            }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    store: await (0, cache_manager_redis_yet_1.redisStore)({
                        socket: {
                            host: configService.get('redis.host'),
                            port: configService.get('redis.port'),
                            tls: configService.get('redis.tls'),
                        },
                        password: configService.get('redis.password'),
                    }),
                    ttl: 300,
                }),
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            wallet_module_1.WalletModule,
            transaction_module_1.TransactionModule,
            queue_module_1.QueueModule,
            health_module_1.HealthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map