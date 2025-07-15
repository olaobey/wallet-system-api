import { Wallet } from '../../wallet/entities/wallet.entity';
export declare class User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    wallets: Wallet[];
}
