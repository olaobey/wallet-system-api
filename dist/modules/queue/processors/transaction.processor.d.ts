import { OnModuleInit } from '@nestjs/common';
import { WalletService } from '../../wallet/wallet.service';
import { QueueService } from '../queue.service';
export declare class TransactionProcessor implements OnModuleInit {
    private readonly walletService;
    private readonly queueService;
    private readonly logger;
    private readonly maxRetries;
    constructor(walletService: WalletService, queueService: QueueService);
    onModuleInit(): Promise<void>;
    private startProcessing;
    private processMessage;
    private handleTransaction;
    private handleProcessingError;
}
