import { HttpException } from '@nestjs/common';
export declare class InsufficientFundsException extends HttpException {
    constructor(message?: string);
}
