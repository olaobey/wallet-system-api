import { IsString, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferDto {
  @ApiProperty({ example: 'wallet-123' })
  @IsString()
  fromWalletId!: string;

  @ApiProperty({ example: 'wallet-456' })
  @IsString()
  toWalletId!: string;

  @ApiProperty({ example: '23617uidxxxx' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: 75.0 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: 'USD', required: false })
  @IsString()
  currency!: string;

  @ApiProperty({ example: 'Payment for services', required: false })
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Transaction reference', required: false })
  @IsString()
  @IsOptional()
  reference?: string;
}
