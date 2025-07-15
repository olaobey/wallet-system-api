import { forwardRef, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { TransactionProcessor } from './processors/transaction.processor';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [forwardRef(() => WalletModule)],
  providers: [QueueService, TransactionProcessor],
  exports: [QueueService],
})
export class QueueModule {}
