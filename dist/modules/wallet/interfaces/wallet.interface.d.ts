export interface IWallet {
    id: string;
    userId?: string;
    walletId: string;
    transactionId: string;
    amount: number;
    currency: string;
    balanceBefore?: number;
    balanceAfter?: number;
    description?: string;
    metadata?: Record<string, any>;
    relatedUserId?: string;
    createdAt: Date;
    processedAt?: Date;
}
export interface ICreateWallet {
    userId?: string;
    walletId: string;
    transactionId: string;
    amount: number;
    currency?: string;
    balanceBefore?: number;
    balanceAfter?: number;
    description?: string;
    metadata?: Record<string, any>;
    relatedUserId?: string;
    fromWalletId?: string;
    toWalletId?: string;
}
