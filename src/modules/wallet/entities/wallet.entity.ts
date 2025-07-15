import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ unique: true })
  walletName!: string;

  @Index()
  @Column({ unique: true, type: 'uuid' })
  userId!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance!: number;

  @Column({ default: 'USD' })
  currency!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.wallets)
  @Index()
  user!: User;

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions!: Transaction[];

  @Column({ type: 'bigint', default: 0 })
  version!: number;
}
