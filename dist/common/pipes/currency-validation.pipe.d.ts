import { PipeTransform } from '@nestjs/common';
export declare class CurrencyValidationPipe implements PipeTransform {
    private readonly supportedCurrencies;
    transform(value: any): string;
}
