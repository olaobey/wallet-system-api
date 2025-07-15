import { HttpException, HttpStatus } from '@nestjs/common';

export class InsufficientFundsException extends HttpException {
  constructor(message = 'Insufficient funds') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
