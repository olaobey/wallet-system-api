import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Transaction } from './entities/transaction.entity';
import { TransactionHistoryDto } from './dto/transaction-history.dto';
import { ITransaction } from './interfaces/transaction.interface';
export declare class TransactionService {
    private transactionRepository;
    private cacheManager;
    constructor(transactionRepository: Repository<Transaction>, cacheManager: Cache);
    getTransactionHistory(walletId: string, queryDto: TransactionHistoryDto): Promise<{
        transactions: ITransaction[];
        total: number;
        page: number;
        limit: number;
    }>;
    getTransactionById(transactionId: string): Promise<ITransaction | null>;
}
