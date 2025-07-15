export declare enum TransactionType {
    DEPOSIT = "deposit",
    WITHDRAW = "withdrawal",
    TRANSFER_OUT = "transfer_out",
    TRANSFER_IN = "transfer_in"
}
export declare enum TransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export interface JwtPayload {
    sub: string;
    email: string;
    iat?: number;
    exp?: number;
}
export interface CacheKey {
    walletBalance: (walletId: string) => string;
    transactionHistory: (walletId: string, page: number, limit: number) => string;
}
export declare const CACHE_KEYS: CacheKey;
