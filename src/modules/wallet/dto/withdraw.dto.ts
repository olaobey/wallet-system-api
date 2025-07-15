import { IsString, IsNumber, Min, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDto {
  @ApiProperty({ example: 'wallet-123' })
  @IsString()
  walletId!: string;

  @ApiProperty({ example: '23617uidxxxx' })
  @IsString()
  userId!: string;

  @ApiProperty({ example: 'USD', required: false })
  @IsOptional()
  @IsIn(['USD', 'CAD', 'NGN'], {
    message: 'Currency must be one of: USD, CAD, NGN',
  })
  @IsString()
  currency!: string;

  @ApiProperty({ example: 50.25 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: 'ATM withdrawal', required: false })
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Transaction reference', required: false })
  @IsString()
  @IsOptional()
  reference?: string;
}
