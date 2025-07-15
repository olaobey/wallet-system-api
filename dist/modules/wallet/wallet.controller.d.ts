import { Request } from 'express';
import { WalletService } from './wallet.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransferDto } from './dto/transfer.dto';
import { BalanceDto } from './dto/balance.dto';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    deposit(depositDto: DepositDto): Promise<{
        message: string;
    }>;
    create(createWalletDto: CreateWalletDto): Promise<{
        message: string;
        wallet: import("./entities/wallet.entity").Wallet;
    }>;
    update(updateWalletDto: UpdateWalletDto): Promise<{
        message: string;
        updatedWallet: import("./entities/wallet.entity").Wallet;
    }>;
    withdraw(withdrawDto: WithdrawDto, currency: string): Promise<{
        message: string;
    }>;
    transfer(req: Request, transferDto: TransferDto): Promise<{
        message: string;
    }>;
    getBalance(userId: string): Promise<BalanceDto>;
    getTransactions(userId: string): Promise<import("../transaction/entities/transaction.entity").Transaction[]>;
    getWallet(walletId: string): Promise<import("./entities/wallet.entity").Wallet | null>;
}
