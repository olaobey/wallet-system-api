"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const wallet_exception_filter_1 = require("./common/filters/wallet-exception.filter");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.enableCors({ origin: '*' });
    logger.log('CORS enabled');
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(), new wallet_exception_filter_1.WalletExceptionFilter());
    logger.log('Global exception filter applied');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        exceptionFactory: (errors) => {
            console.error('Validation errors:', errors);
            return new common_1.BadRequestException('Validation failed');
        },
    }));
    logger.log('Global validation pipe applied');
    app.use((0, cookie_parser_1.default)());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('WALLET SYSTEM API')
        .setDescription('API documentation for a nestJS-based API for a wallate system with NestJS, RabbitMQ, Redis')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Authentication', 'User registration and login')
        .addTag('Transactions', 'Transaction processing and history')
        .addTag('Wallets', 'Wallet management operations')
        .addTag('Health', 'Health check endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('apidocs', app, document);
    logger.log('Swagger documentation set up at /apidocs');
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT') || 3000;
    await app.listen(port);
    logger.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map