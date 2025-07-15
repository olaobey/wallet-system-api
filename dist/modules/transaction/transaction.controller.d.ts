import { TransactionService } from './transaction.service';
import { TransactionHistoryDto } from './dto/transaction-history.dto';
export declare class TransactionController {
    private readonly transactionService;
    constructor(transactionService: TransactionService);
    getTransactionHistory(walletId: string, queryDto: TransactionHistoryDto): Promise<{
        transactions: import("./interfaces/transaction.interface").ITransaction[];
        total: number;
        page: number;
        limit: number;
    }>;
    getTransaction(transactionId: string): Promise<import("./interfaces/transaction.interface").ITransaction | null>;
}
