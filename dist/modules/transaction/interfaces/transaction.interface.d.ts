import { TransactionType, TransactionStatus } from '../../../common/types';
export interface ITransaction {
    id: string;
    transactionId: string;
    userId?: string;
    type: TransactionType;
    amount: number;
    currency: string;
    balanceBefore: number;
    balanceAfter: number;
    processedAt: Date;
    status: TransactionStatus;
    walletId: string;
    fromWalletId?: string;
    toWalletId?: string;
    description?: string;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICreateTransaction {
    transactionId: string;
    type: TransactionType;
    amount: number;
    walletId: string;
    fromWalletId?: string;
    toWalletId?: string;
    description?: string;
    metadata?: any;
}
export interface IUpdateTransaction {
    status?: TransactionStatus;
    description?: string;
    metadata?: any;
}
