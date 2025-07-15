import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';
import { WalletExceptionFilter } from './common/filters/wallet-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap'); // Logger instance
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({ origin: '*' });
  logger.log('CORS enabled');

  // Use Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter(), new WalletExceptionFilter());
  logger.log('Global exception filter applied');

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // 👈 REQUIRED for type coercion (e.g. string → number)
      },
      exceptionFactory: (errors) => {
        console.error('Validation errors:', errors); // 👈 ADD THIS
        return new BadRequestException('Validation failed');
      },
    }),
  );
  logger.log('Global validation pipe applied');
  app.use(cookieParser());

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('WALLET SYSTEM API')
    .setDescription(
      'API documentation for a nestJS-based API for a wallate system with NestJS, RabbitMQ, Redis',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User registration and login')
    .addTag('Transactions', 'Transaction processing and history')
    .addTag('Wallets', 'Wallet management operations')
    .addTag('Health', 'Health check endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('apidocs', app, document);
  logger.log('Swagger documentation set up at /apidocs');

  // Load environment variables
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
