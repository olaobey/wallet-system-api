import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class CurrencyValidationPipe implements PipeTransform {
  private readonly supportedCurrencies = ['USD', 'EUR', 'GBP', 'NGN'];

  transform(value: any) {
    if (!value || typeof value !== 'string') {
      throw new BadRequestException('Currency must be a valid string');
    }

    const currency = value.toUpperCase();

    if (!this.supportedCurrencies.includes(currency)) {
      throw new BadRequestException(`Currency ${currency} is not supported`);
    }

    return currency;
  }
}
