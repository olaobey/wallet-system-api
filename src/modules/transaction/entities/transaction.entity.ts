import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { TransactionType, TransactionStatus } from '../../../common/types';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  @Index()
  userId?: string;

  @Column({ unique: true })
  @Index()
  transactionId!: string;

  @Column({ type: 'enum', enum: TransactionType })
  type!: TransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @Column({ name: 'related_user_id', nullable: true })
  relatedUserId?: string;

  @Column({ name: 'balance_before', type: 'decimal', precision: 15, scale: 2 })
  balanceBefore!: number;

  @Column({ name: 'balance_after', type: 'decimal', precision: 15, scale: 2 })
  balanceAfter!: number;

  @Column({ default: 'USD' })
  currency!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any>;

  @CreateDateColumn()
  @Index()
  createdAt!: Date;

  @UpdateDateColumn()
  @Index()
  updatedAt!: Date;

  @Column({ name: 'processed_at', nullable: true })
  processedAt!: Date;

  @Column({ name: 'wallet_id', type: 'uuid' })
  @Index()
  walletId!: string;

  // For transfers
  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  wallet!: Wallet;

  @Column({ type: 'uuid', nullable: true })
  fromWalletId?: string;

  @Column({ type: 'uuid', nullable: true })
  toWalletId?: string;

  @Index()
  @Column({ unique: true, nullable: true })
  idempotencyKey?: string;
}
