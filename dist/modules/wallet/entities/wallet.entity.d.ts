import { User } from '../../user/entities/user.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';
export declare class Wallet {
    id: string;
    walletName: string;
    userId: string;
    balance: number;
    currency: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    transactions: Transaction[];
    version: number;
}
