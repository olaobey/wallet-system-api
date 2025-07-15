import {
  Controller,
  Post,
  Get,
  Req,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransferDto } from './dto/transfer.dto';
import { BalanceDto } from './dto/balance.dto';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrencyValidationPipe } from '../../common/pipes/currency-validation.pipe';
import { JwtPayload } from '../../common/types/index';
import { TransactionLoggingInterceptor } from '../../common/interceptors/transaction-logging.interceptor';
import { WalletExceptionFilter } from 'src/common/filters/wallet-exception.filter';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('deposit')
  @UseFilters(WalletExceptionFilter)
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(TransactionLoggingInterceptor)
  @ApiOperation({ summary: 'Deposit funds to wallet' })
  @ApiResponse({
    status: 202,
    description: 'Deposit request accepted for processing',
  })
  async deposit(@Body() depositDto: DepositDto) {
    await this.walletService.queueDeposit(depositDto);
    return { message: 'Deposit request accepted for processing' };
  }

  @Post('create')
  @UseFilters(WalletExceptionFilter)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(TransactionLoggingInterceptor)
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiResponse({
    status: 201,
    description: 'Wallet created successfully',
  })
  async create(@Body() createWalletDto: CreateWalletDto) {
    const wallet = await this.walletService.createWallet(createWalletDto);
    return { message: 'Wallet created successfully', wallet };
  }

  @Post('update')
  @UseFilters(WalletExceptionFilter)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(TransactionLoggingInterceptor)
  @ApiOperation({ summary: 'Update wallet details' })
  @ApiResponse({
    status: 200,
    description: 'Wallet updated successfully',
  })
  async update(
    @Body(new CurrencyValidationPipe()) updateWalletDto: UpdateWalletDto,
  ) {
    const updatedWallet =
      await this.walletService.updateWallet(updateWalletDto);
    return { message: 'Wallet updated successfully', updatedWallet };
  }

  @Post('withdraw')
  @UseFilters(WalletExceptionFilter)
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(TransactionLoggingInterceptor)
  @ApiOperation({ summary: 'Withdraw funds from wallet' })
  @ApiResponse({
    status: 202,
    description: 'Withdrawal request accepted for processing',
  })
  async withdraw(
    @Body() withdrawDto: WithdrawDto,
    @Body('currency', new CurrencyValidationPipe()) currency: string,
  ) {
    withdrawDto.currency = currency; // overwrite with validated/normalized currency
    await this.walletService.queueWithdraw(withdrawDto);
    return { message: 'Withdrawal request accepted for processing' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('transfer')
  @UseFilters(WalletExceptionFilter)
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(TransactionLoggingInterceptor)
  @ApiOperation({ summary: 'Transfer funds between wallets' })
  @ApiResponse({
    status: 202,
    description: 'Transfer request accepted for processing',
  })
  async transfer(@Req() req: Request, @Body() transferDto: TransferDto) {
    const user = req.user as JwtPayload;
    const userId = user.sub;

    const currencyPipe = new CurrencyValidationPipe();
    transferDto.currency = currencyPipe.transform(transferDto.currency);

    await this.walletService.queueTransfer(transferDto, userId);

    return { message: 'Transfer request accepted for processing' };
  }
  @Get('balance/:userId')
  @UseFilters(WalletExceptionFilter)
  @UseInterceptors(TransactionLoggingInterceptor)
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({
    status: 200,
    description: 'Wallet balance retrieved',
    type: BalanceDto,
  })
  async getBalance(@Param('userId') userId: string): Promise<BalanceDto> {
    return await this.walletService.getBalance(userId);
  }

  @Get('transactions/:userId')
  @UseFilters(WalletExceptionFilter)
  @UseInterceptors(TransactionLoggingInterceptor)
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved' })
  async getTransactions(@Param('userId') userId: string) {
    return await this.walletService.getTransactionHistory(userId);
  }

  @Get(':walletId')
  @UseFilters(WalletExceptionFilter)
  @UseInterceptors(TransactionLoggingInterceptor)
  @ApiOperation({ summary: 'Get wallet details' })
  @ApiResponse({ status: 200, description: 'Wallet details retrieved' })
  async getWallet(@Param('walletId') walletId: string) {
    return await this.walletService.getWalletById(walletId);
  }
}
