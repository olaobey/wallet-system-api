import { Wallet } from '../../wallet/entities/wallet.entity';
import { TransactionType, TransactionStatus } from '../../../common/types';
export declare class Transaction {
    id: string;
    userId?: string;
    transactionId: string;
    type: TransactionType;
    amount: number;
    status: TransactionStatus;
    relatedUserId?: string;
    balanceBefore: number;
    balanceAfter: number;
    currency: string;
    description?: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    processedAt: Date;
    walletId: string;
    wallet: Wallet;
    fromWalletId?: string;
    toWalletId?: string;
    idempotencyKey?: string;
}
