import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Transaction]),
    forwardRef(() => QueueModule),
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
