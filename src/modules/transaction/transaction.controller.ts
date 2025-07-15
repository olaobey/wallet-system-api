import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { TransactionService } from './transaction.service';
import { TransactionHistoryDto } from './dto/transaction-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionLoggingInterceptor } from '../../common/interceptors/transaction-logging.interceptor';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('wallet/:walletId')
  @UseInterceptors(TransactionLoggingInterceptor)
  @ApiOperation({ summary: 'Get transaction history for wallet' })
  @ApiResponse({
    status: 200,
    description: 'Transaction history retrieved successfully',
  })
  async getTransactionHistory(
    @Param('walletId') walletId: string,
    @Query() queryDto: TransactionHistoryDto,
  ) {
    return this.transactionService.getTransactionHistory(walletId, queryDto);
  }

  @Get(':transactionId')
  @UseInterceptors(TransactionLoggingInterceptor)
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(@Param('transactionId') transactionId: string) {
    return this.transactionService.getTransactionById(transactionId);
  }
}
