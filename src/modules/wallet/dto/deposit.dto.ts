import { IsString, IsNumber, Min, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DepositDto {
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

  @ApiProperty({ example: 100.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: 'Salary deposit', required: false })
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Transaction reference', required: false })
  @IsString()
  @IsOptional()
  reference?: string;
}
