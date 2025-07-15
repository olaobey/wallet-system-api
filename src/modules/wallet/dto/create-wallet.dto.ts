import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWalletDto {
  @ApiProperty({ example: '23617uidxxxx' })
  @IsString()
  userId!: string;

  @ApiProperty({ example: 'USD', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['USD', 'CAD', 'NGN'])
  currency?: string;

  @ApiProperty({ example: 'Personal Wallet', required: false })
  @IsOptional()
  @IsString()
  walletName?: string;
}
