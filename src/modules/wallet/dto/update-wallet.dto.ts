import { IsOptional, IsBoolean, IsString, IsIn, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWalletDto {
  @ApiProperty({ example: '23617uidxxxx' })
  @IsUUID()
  @IsString()
  userId!: string;

  @ApiProperty({ example: 'true', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'USD', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['USD', 'CAD', 'NGN'])
  currency?: string;
}
