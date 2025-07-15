import { ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
export declare class WalletExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: HttpException, host: ArgumentsHost): void;
}
