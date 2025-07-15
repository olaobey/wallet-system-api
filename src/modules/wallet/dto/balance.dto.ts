import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BalanceDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId!: string;

  @ApiProperty({ description: 'Available balance' })
  @IsNumber()
  balance!: number;

  @ApiProperty({ description: 'Currency code' })
  @IsString()
  currency!: string;

  @ApiProperty({ description: 'Last updated timestamp' })
  lastUpdated!: Date;
}
